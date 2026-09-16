"""
Automated Test Runner for MoSJE SIH 2026 Scheme Matching Platform.
Runs all unit and integration test suites.
"""
import unittest
import sys
import os

if __name__ == "__main__":
    # Ensure workspace root is in sys.path
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    if root_dir not in sys.path:
        sys.path.insert(0, root_dir)

    print("=" * 70)
    print(" Running Full Automated Test Suite (MoSJE SIH 2026 - Problem #26092)")
    print("=" * 70)

    loader = unittest.TestLoader()
    suite = loader.discover(start_dir=os.path.dirname(__file__), pattern="test_*.py")

    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)

    print("=" * 70)
    if result.wasSuccessful():
        print(" ALL TESTS PASSED! (Zero errors, Zero regressions)")
        sys.exit(0)
    else:
        print(f" TESTS FAILED: {len(result.failures)} failures, {len(result.errors)} errors")
        sys.exit(1)
