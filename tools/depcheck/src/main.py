#!/usr/bin/env python3
import sys
import os
import json
from tqdm import tqdm
from package_mgmt import *

def find_packages_with_homepage(deb_root) -> list[Package]:
    packages = []
    for root, dirs, files in os.walk(deb_root):
        for file in files:
            if file == 'control':
                path = os.path.join(root, file)
                try:
                    package = Package.from_file(deb_root, path)
                    if package.homepage and package.commit:
                        packages.append(package)
                except ValueError as e:
                    print(f"Error parsing control file '{path}': {e}", file=sys.stderr)

    return packages


def parse_arguments() -> str:
    if len(sys.argv) != 2:
        print(f"Usage: python {sys.argv[0]} <repo_root>")
        sys.exit(1)
    return sys.argv[1]


def validate_deb_path(repo_root) -> str:
    deb_path = os.path.join(repo_root, 'debian')
    if not os.path.isdir(deb_path):
        print(f"Error: {deb_path} is not a valid directory.")
        sys.exit(1)
    return deb_path


def check_for_updates(controls: list[Package]) -> list[tuple[Package, Release]]:
    updates = []
    for control in tqdm(controls):
        release = get_latest_release(control)
        if release:
            updates.append((control, release))

    return updates


def write_summary(repo_root, updates: list[tuple[Package, Release]]) -> str:
    output_dir = os.path.join(repo_root, 'build', 'debian')
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    output_path = os.path.join(output_dir, 'depcheck.txt')
    with open(output_path, 'w') as f:
        f.write(f"Total packages to update: {len(updates)}\n")
        for control, release in updates:
            f.write(f"\nName: {control.name}\n")
            f.write(f"URL: {control.homepage}/releases\n")
            f.write(f"Current version: {control.dep_version}\n")
            f.write(f"Latest version: {str(release.verison)} ({release.commit[:7]})\n")
            f.write(f"Changelog:\n{release.changelog}\n")
    return output_path


def write_changelogs(deb_path, updates: list[tuple[Package, Release]]):
    for package, release in updates:
        file_name = f"{package.display_name}-{str(release.verison)}.md"
        base_path = os.path.join(deb_path, package.name)
        if not os.path.exists(base_path):
            print(f'Error: {package.name} not found at {base_path}')
            continue

        output_dir = os.path.join(
            base_path, 'etc', 'tinyllama', 'patchnotes.d')
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)

        for file in os.listdir(output_dir):
            os.remove(os.path.join(output_dir, file))

        with open(os.path.join(output_dir, file_name), 'w') as f:
            f.write(release.changelog)


def print_updates(updates: list[tuple[Package, Release]]) -> None:
    print(f"\nTotal packages to update: {len(updates)}")
    for i, update in enumerate(updates):
        package, release = update
        print(f"\nPackage {i + 1}:")
        print(f"Name: {package.name}")
        print(f"URL: {package.homepage}/releases\n")
        print(f"Current version: {package.dep_version}")
        print(f"Latest version: {str(release.verison)} ({release.commit[:7]})")
        print(f"Changelog:\n{release.changelog}\n")


def main():
    repo_root = parse_arguments()
    deb_path = validate_deb_path(repo_root)
    packages = find_packages_with_homepage(deb_path)
    updates = check_for_updates(packages)
    summary_path = write_summary(repo_root, updates)
    print_updates(updates)
    if len(updates) <= 0:
        return

    answer = input(
        "Do you want to update these packages? (y/n): ")
    if answer.lower() == 'y':
        for package, release in updates:
            apply_update(package, release)
        write_changelogs(deb_path, updates)
    print(f"A summary of the updates has been written to {summary_path}.")
    if answer.lower() != 'y':
        sys.exit(2)
    else:
        return


if __name__ == '__main__':
    main()
