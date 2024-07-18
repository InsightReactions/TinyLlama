#!/bin/bash
PACKAGE=$1
if [ -z "$PACKAGE" ]; then
  echo "Error: package is not defined."
  echo "Usage: $0 <package>"
  echo "The package can be any package folder in the debian directory containing a DEBIAN folder and a control file."
  exit 1
fi

set -eu

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$(dirname "$SCRIPT_DIR/../..")" && pwd)"
BUILD_DIR="$REPO_ROOT/build/debian"

# Check to see if the PACKAGE exists.
if [ ! -d "$SCRIPT_DIR/$PACKAGE" ]; then
    echo "Error: package does not exist at path: $SCRIPT_DIR/$PACKAGE"
    exit 1
fi

# If build directory does not exist, create it and copy the package to it.
mkdir -p "$BUILD_DIR"
rm -rf "$BUILD_DIR/$PACKAGE"
cp -r "$SCRIPT_DIR/$PACKAGE" "$BUILD_DIR/"

cd $BUILD_DIR

if [ "$PACKAGE" = "tinyllama" ]; then
    mkdir -p $PACKAGE/srv/www/TinyLlama
    rsync -a --exclude "__pycache__" --exclude "venv" "$REPO_ROOT/web/" $PACKAGE/srv/www/TinyLlama
fi

chmod -R 0775 $PACKAGE/DEBIAN
dpkg-deb -b $PACKAGE .
