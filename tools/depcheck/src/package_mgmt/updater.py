import os
from .package_manager import Package, Release


def update_package_strings(pkg: Package, rel: Release):
    if not pkg.commit:
        raise ValueError(f"The package {pkg.name} does not have a commit")

    pkg_hash = pkg.commit[:7]
    rel_hash = rel.commit[:7]
    for root, dirs, files in os.walk(pkg.deb_path):
        for file in files:
            path = os.path.join(root, file)
            if os.path.getsize(path) > 1024 * 1024:
                continue
            
            try:
                with open(path, 'r+') as f:
                    content: str = f.read()
                    if str(pkg.dep_version) in content or pkg.commit in content or pkg_hash in content:
                        content = content.replace(str(pkg.dep_version), str(rel.verison)).replace(
                            pkg.commit, rel.commit).replace(pkg_hash, rel_hash)
                        f.seek(0)
                        f.write(content)
                        f.truncate()
                        print(f"Updated '{file}' for package {pkg.name}")
            except UnicodeDecodeError:
                pass


def apply_update(package: Package, release: Release):
    update_package_strings(package, release)
