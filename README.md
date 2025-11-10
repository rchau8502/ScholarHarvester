# ScholarHarvester Utilities

This repository currently provides a lightweight command-line utility for
scanning directories for lines that match a specified pattern ("error" by
default). The tool ignores binary files and hidden files unless you explicitly
request otherwise.

## Usage

```bash
python -m scholar_harvester.error_scanner /path/to/scan
```

Useful options:

* `--pattern` – provide a custom regular expression to search for.
* `--case-sensitive` – run a case-sensitive search.
* `--include-hidden` – scan hidden files and directories.
* `--extensions` – restrict the scan to specific file extensions (e.g. `.log`).

The command exits with status code `1` when matches are found (so it can easily
integrate with CI pipelines) and prints the matching lines alongside their
locations.

## Running the tests

```bash
PYTHONPATH=src python -m unittest discover -s tests
```
