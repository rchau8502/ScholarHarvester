from pathlib import Path
import tempfile
import unittest

from scholar_harvester.error_scanner import ErrorMatch, scan_for_errors


class ScanForErrorsTests(unittest.TestCase):
    def setUp(self) -> None:
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name)

    def write_file(self, relative_path: str, content: bytes) -> Path:
        file_path = self.root / relative_path
        file_path.parent.mkdir(parents=True, exist_ok=True)
        file_path.write_bytes(content)
        return file_path

    def test_finds_errors_in_text_file(self) -> None:
        file_path = self.write_file("logs/app.log", b"INFO ok\nERROR something bad\n")

        matches = scan_for_errors(self.root)

        self.assertEqual(len(matches), 1)
        match = matches[0]
        self.assertIsInstance(match, ErrorMatch)
        self.assertEqual(match.path, file_path)
        self.assertEqual(match.line_number, 2)
        self.assertIn("ERROR", match.line_text)

    def test_skips_hidden_files_by_default(self) -> None:
        self.write_file(".cache/hidden.log", b"error hidden\n")

        matches = scan_for_errors(self.root)

        self.assertEqual(matches, [])

    def test_includes_hidden_when_requested(self) -> None:
        hidden = self.write_file(".cache/hidden.log", b"error hidden\n")

        matches = scan_for_errors(self.root, include_hidden=True)

        self.assertEqual(len(matches), 1)
        self.assertEqual(matches[0].path, hidden)

    def test_filters_by_extension(self) -> None:
        self.write_file("logs/app.txt", b"error not counted\n")
        log_file = self.write_file("logs/app.log", b"error counted\n")

        matches = scan_for_errors(self.root, extensions=[".log"])

        self.assertEqual(len(matches), 1)
        self.assertEqual(matches[0].path, log_file)

    def test_binary_files_are_skipped(self) -> None:
        self.write_file("data/binary.bin", b"\x00error\x00")

        matches = scan_for_errors(self.root)

        self.assertEqual(matches, [])

    def test_custom_pattern_with_case_sensitivity(self) -> None:
        file_path = self.write_file("logs/custom.log", b"Warning: Something\n")

        matches = scan_for_errors(
            file_path,
            pattern=r"Warning",
            ignore_case=False,
        )

        self.assertEqual(len(matches), 1)
        self.assertEqual(matches[0].path, file_path)


if __name__ == "__main__":  # pragma: no cover
    unittest.main()
