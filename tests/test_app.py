import sys
import pathlib
import unittest


# Ensure the src/ directory is importable
ROOT = pathlib.Path(__file__).resolve().parents[1]
SRC = ROOT / "src"
if str(SRC) not in sys.path:
    sys.path.insert(0, str(SRC))

import app  # noqa: E402


class TestApp(unittest.TestCase):
    def setUp(self):
        self.client = app.app.test_client()

    def test_home_route(self):
        resp = self.client.get("/")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.get_data(as_text=True), "Hello, AlNoor project!")


if __name__ == "__main__":
    unittest.main()

