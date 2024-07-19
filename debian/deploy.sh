# Deploy first builds the packages, then adds them to the debian repository

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$(dirname "$SCRIPT_DIR/../..")" && pwd)"
DEB_REPO_ROOT="$REPO_ROOT/../debian.insightreactions.github.io"

RELEASE_TYPE=$1
if [[ $RELEASE_TYPE != "testing" && $RELEASE_TYPE != "stable" ]]; then
    echo "Error: Invalid release type."
    echo "Usage: deploy.sh [testing|stable] <package>"
    exit 1
fi

PACKAGE=$2
if [[ -z $PACKAGE ]] || [[ ! -d "$SCRIPT_DIR/$PACKAGE" ]]; then
    echo "Error: Package not provided or not found in directory: $SCRIPT_DIR/$PACKAGE"
    echo "Usage: deploy.sh [testing|stable] <package>"
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

rm -rf "$REPO_ROOT/build/debian/${PACKAGE}_"*.deb

# Build the package
bash $SCRIPT_DIR/build.sh $PACKAGE

cd $DEB_REPO_ROOT

rm -rf "$DEB_REPO_ROOT/docs/pool/$RELEASE_TYPE/main/${PACKAGE}_"*.deb 2>/dev/null || true
cp "$REPO_ROOT/build/debian/${PACKAGE}_"*.deb "$DEB_REPO_ROOT/docs/pool/$RELEASE_TYPE/main/"

# Recompile the repository with the updated/new package
./build.sh $RELEASE_TYPE

git add --all
git status
read -p "Would you like to push these changes? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]
then
    git commit -m "updated repository"
    git push
fi
