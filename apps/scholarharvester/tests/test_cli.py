from typer.testing import CliRunner

from scholarharvester.cli.main import app


def test_adapters_command_lists():
    runner = CliRunner()
    result = runner.invoke(app, ["adapters"])
    assert result.exit_code == 0
    assert "uc" in result.stdout
