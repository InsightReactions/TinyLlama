#!/bin/bash
set -eu

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$(dirname "$SCRIPT_DIR/../..")" && pwd)"
BUILD_DIR="$REPO_ROOT/build/debian"

rm -r "$BUILD_DIR" ||:
mkdir -p "$BUILD_DIR"
cp -r "$SCRIPT_DIR"/* "$BUILD_DIR"
rm "$BUILD_DIR"/*.sh

cd $BUILD_DIR

chmod -R 0775 tinyllama-mdns/DEBIAN
dpkg-deb -b tinyllama-mdns .

mkdir -p tinyllama/srv/www/tinyllama
cp -r "$REPO_ROOT/web"/* tinyllama/srv/www/tinyllama/
rm -r tinyllama/srv/www/tinyllama/__pycache__
chmod -R 0775 tinyllama/DEBIAN
dpkg-deb -b tinyllama .

chmod -R 0775 ollama/DEBIAN
dpkg-deb -b ollama .

chmod -R 0775 open-webui/DEBIAN
dpkg-deb -b open-webui .

chmod -R 0775 stableswarmui/DEBIAN
dpkg-deb -b stableswarmui .
