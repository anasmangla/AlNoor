import io
import sys
import pathlib
import unittest
from contextlib import redirect_stdout


# Ensure the src/ directory is importable
ROOT = pathlib.Path(__file__).resolve().parents[1]
SRC = ROOT / "src"
if str(SRC) not in sys.path:
    sys.path.insert(0, str(SRC))

import main  # noqa: E402


class TestMain(unittest.TestCase):
    def test_main_prints_hello_world(self) -> None:
        buf = io.StringIO()
        with redirect_stdout(buf):
            main.main()
        self.assertEqual(buf.getvalue().strip(), "Hello, world!")


if __name__ == "__main__":
    unittest.main()

