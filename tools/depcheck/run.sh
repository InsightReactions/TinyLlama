#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$(dirname "$SCRIPT_DIR/../../..")" && pwd)"

cd $SCRIPT_DIR

if [ ! -d ".venv" ]; then
    python3 -m venv .venv
fi

source .venv/bin/activate
echo "Updating depcheck Python dependencies..."
pip install -r requirements.txt >/dev/null 2>&1
echo "Running depcheck to update dependencies..."
python3 src/main.py $REPO_ROOT
deactivate

pkgs=$(sed -n 's/^Name:\s*\(.*\)$/\1/p' $REPO_ROOT/build/debian/depcheck.txt | paste -sd,)
echo "The following packages may be built and deployed: $pkgs"
echo "Please review the changes to ensure they are correct before proceeding with building and deployment"
read -p "Would you like to build and deploy these packages to the testing repo? (y/n) " answer
if [ "$answer" = "y" ]; then
    bash $REPO_ROOT/debian/deploy.sh testing $pkgs
fi
