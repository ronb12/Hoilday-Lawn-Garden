#!/bin/bash

set -e

echo "==============================="
echo "  Holliday Lawn & Garden: MASTER SITE CHECK"
echo "==============================="

echo "\n[0/4] Running Python auto-fix script (fix_issues.py)..."
python3 fix_issues.py || { echo "Python auto-fix failed."; exit 1; }

echo "\n[0.5/4] Running Node.js comprehensive cleanup (comprehensive-cleanup.js)..."
node comprehensive-cleanup.js || { echo "Node.js comprehensive cleanup failed."; exit 1; }

echo "\n[1/4] Running Node.js master site check..."
node master-site-check.js || { echo "Node.js master site check failed."; exit 1; }

echo "\n[2/4] Running Python Selenium functional tests..."
python3 run_tests.py || { echo "Python functional tests failed."; exit 1; }

echo "\n[3/4] Running Python Selenium design/visual tests..."
python3 run_design_tests.py || { echo "Python design/visual tests failed."; exit 1; }

echo "\n==============================="
echo "  ALL SITE CHECKS COMPLETE!"
echo "===============================" 