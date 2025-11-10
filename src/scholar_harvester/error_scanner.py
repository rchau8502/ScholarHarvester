"""Scan files for the presence of error markers.

This module exposes a small utility that walks a directory tree and collects
any lines that match a configurable pattern ("error" by default). It attempts
to skip binary files and, by default, hidden files and directories to reduce
noise in the output.
"""

from __future__ import annotations

import argparse
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable, Iterator, List, Optional, Sequence, Set


@dataclass(frozen=True)
class ErrorMatch:
    """A single match reported by :func:`scan_for_errors`."""

    path: Path
    line_number: int
    line_text: str

    def format(self) -> str:
        """Return a human readable representation of the match."""

        return f"{self.path}:{self.line_number}: {self.line_text.rstrip()}"


def _normalize_extensions(extensions: Optional[Iterable[str]]) -> Optional[Set[str]]:
    if extensions is None:
        return None
    normalized: Set[str] = set()
    for ext in extensions:
        ext = ext.strip()
        if not ext:
            continue
        if not ext.startswith("."):
            ext = "." + ext
        normalized.add(ext.lower())
    return normalized or None


def _is_hidden(path: Path, root: Path) -> bool:
    try:
        relative_parts: Sequence[str] = path.relative_to(root).parts
    except ValueError:
        # If ``path`` is not below ``root`` fall back to checking all parts.
        relative_parts = path.parts
    return any(part.startswith(".") for part in relative_parts if part not in {".", ".."})


def _iter_text_lines(file_path: Path) -> Iterator[tuple[int, str]]:
    try:
        with file_path.open("r", encoding="utf-8", errors="ignore") as handle:
            for idx, line in enumerate(handle, start=1):
                yield idx, line
    except OSError as exc:  # pragma: no cover - defensive guard
        raise RuntimeError(f"Failed to read {file_path}: {exc}") from exc


def _is_binary(file_path: Path) -> bool:
    try:
        with file_path.open("rb") as handle:
            chunk = handle.read(1024)
        return b"\0" in chunk
    except OSError:
        return False


def scan_for_errors(
    root: Path | str,
    pattern: str = "error",
    *,
    ignore_case: bool = True,
    include_hidden: bool = False,
    extensions: Optional[Iterable[str]] = None,
) -> List[ErrorMatch]:
    """Scan ``root`` for lines that match ``pattern``.

    Parameters
    ----------
    root:
        The root directory to scan. If a file is provided, only that file is
        scanned.
    pattern:
        The regular expression used to identify matching lines. The default is
        ``"error"``.
    ignore_case:
        When set to ``True`` (the default) the search is case-insensitive.
    include_hidden:
        Whether hidden files and directories should be scanned.
    extensions:
        Optional iterable of file extensions to include (e.g. [".py", "log"]).
        When provided, only files with matching extensions are considered.

    Returns
    -------
    list of :class:`ErrorMatch`
        Each entry describes a single matched line.
    """

    root_path = Path(root)
    if not root_path.exists():
        raise FileNotFoundError(f"Path does not exist: {root_path}")

    flags = re.IGNORECASE if ignore_case else 0
    try:
        regex = re.compile(pattern, flags)
    except re.error as exc:  # pragma: no cover - invalid pattern is caller error
        raise ValueError(f"Invalid pattern '{pattern}': {exc}") from exc

    allowed_extensions = _normalize_extensions(extensions)

    paths_to_scan: List[Path]
    if root_path.is_dir():
        paths_to_scan = [p for p in root_path.rglob("*") if p.is_file()]
    else:
        paths_to_scan = [root_path]

    matches: List[ErrorMatch] = []
    for file_path in paths_to_scan:
        if not include_hidden and _is_hidden(file_path, root_path):
            continue
        if allowed_extensions is not None and file_path.suffix.lower() not in allowed_extensions:
            continue
        if _is_binary(file_path):
            continue

        for line_number, line_text in _iter_text_lines(file_path):
            if regex.search(line_text):
                matches.append(ErrorMatch(file_path, line_number, line_text))

    matches.sort(key=lambda item: (str(item.path), item.line_number))
    return matches


def _build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Scan files for error messages.")
    parser.add_argument(
        "path",
        nargs="?",
        default=".",
        help="Directory or file to scan. Defaults to the current working directory.",
    )
    parser.add_argument(
        "--pattern",
        default="error",
        help="Regular expression to search for. Defaults to 'error'.",
    )
    parser.add_argument(
        "--case-sensitive",
        action="store_true",
        help="Make the search case-sensitive (default is case-insensitive).",
    )
    parser.add_argument(
        "--include-hidden",
        action="store_true",
        help="Include hidden files and directories in the scan.",
    )
    parser.add_argument(
        "--extensions",
        nargs="*",
        default=None,
        help="Optional list of file extensions to include (e.g. .py .log).",
    )
    return parser


def main(argv: Optional[Sequence[str]] = None) -> int:
    parser = _build_parser()
    args = parser.parse_args(argv)

    matches = scan_for_errors(
        args.path,
        pattern=args.pattern,
        ignore_case=not args.case_sensitive,
        include_hidden=args.include_hidden,
        extensions=args.extensions,
    )

    if not matches:
        print("No matches found.")
        return 0

    for match in matches:
        print(match.format())

    print(f"Found {len(matches)} matching line(s).")
    return 1


if __name__ == "__main__":  # pragma: no cover - CLI entry point
    raise SystemExit(main())
