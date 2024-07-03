# Deploy first builds the packages, then adds them to the debian repository
set -eu

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$(dirname "$SCRIPT_DIR/../..")" && pwd)"
DEB_REPO_ROOT="$REPO_ROOT/../debian.insightreactions.github.io"

bash $SCRIPT_DIR/build.sh

cd $DEB_REPO_ROOT

# Push new build
rm -rf "$DEB_REPO_ROOT/docs/pool/main/*.deb" 
cp "$REPO_ROOT/build/debian"/*.deb "$DEB_REPO_ROOT/docs/pool/main/"
./build.sh
git add --all
git commit -m "updated repository"
git push
