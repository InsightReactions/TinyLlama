import os
from .package_manager import Package, Release


def apply_update(package: Package, release: Release):
    if package.name == 'tlweb-open-webui':
        apply_open_webui(package, release)
    else:
        raise NotImplementedError(f"Update strategy for {package.name} is not implemented")


def apply_open_webui(pkg: Package, rel: Release) -> None:
    commit = None
    with open(os.path.join(pkg.deb_path, 'DEBIAN', 'postinst'), 'r') as f:
        for line in f.readlines():
            if "open-webui:git-" in line:
                commit = line.rsplit('-', 1)[-1].strip()
    if commit is None:
        raise Exception("Unable to find git commit hash from postinst")

    for root, dirs, files in os.walk(pkg.deb_path):
        for file in files:
            path = os.path.join(root, file)
            should_update = False
            file_size = os.path.getsize(path)

            if file_size <= 1024 * 1024: # 1MB
                with open(path, 'r') as f:
                    content = f.read()
                    if str(pkg.dep_version) in content or commit in content:
                        should_update = True
            
            if should_update:
                with open(path, 'w') as f:
                    f.write(content.replace(str(pkg.dep_version), str(rel.verison)).replace(commit, rel.commit[:7]))
                print("Updated", path)
