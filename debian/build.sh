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

chmod -R 0775 tinyllama-default/DEBIAN
dpkg-deb -b tinyllama-default .

chmod -R 0775 tinyllama-plus/DEBIAN
dpkg-deb -b tinyllama-plus .

chmod -R 0775 tinyllama-ollama/DEBIAN
dpkg-deb -b tinyllama-ollama .

chmod -R 0775 tlweb-open-webui/DEBIAN
dpkg-deb -b tlweb-open-webui .

chmod -R 0775 tlweb-stableswarmui/DEBIAN
dpkg-deb -b tlweb-stableswarmui .
