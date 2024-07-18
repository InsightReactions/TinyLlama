# Deploy first builds the packages, then adds them to the debian repository
RELEASE_TYPE=$1
if [[ $RELEASE_TYPE != "testing" && $RELEASE_TYPE != "stable" ]]; then
    echo "Invalid release type."
    echo "Usage: deploy.sh [testing|stable]"
    exit 1
fi

set -eu

if [[ $RELEASE_TYPE == "stable" ]]; then
    read -p "Are you sure you want to deploy a PRODUCTION release? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]
    then
        exit 1
    fi
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$(dirname "$SCRIPT_DIR/../..")" && pwd)"
DEB_REPO_ROOT="$REPO_ROOT/../debian.insightreactions.github.io"

bash $SCRIPT_DIR/build.sh

cd $DEB_REPO_ROOT

# Push new build
if [[ $RELEASE_TYPE == "stable" ]]; then
    rm -rf "$DEB_REPO_ROOT/docs/pool/stable/main/"*.deb
    cp "$REPO_ROOT/build/debian"/*.deb "$DEB_REPO_ROOT/docs/pool/stable/main/"
    ./build.sh $RELEASE_TYPE
else
    rm -rf "$DEB_REPO_ROOT/docs/pool/testing/main/"*.deb
    cp "$REPO_ROOT/build/debian"/*.deb "$DEB_REPO_ROOT/docs/pool/testing/main/"
    ./build.sh $RELEASE_TYPE
fi
git add --all
git commit -m "updated repository"
git push
