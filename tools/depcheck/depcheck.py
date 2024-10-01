#!/usr/bin/env python3
import sys
import os
import requests
import yaml
import json
from packaging.version import Version
from tqdm import tqdm
from bs4 import BeautifulSoup, Tag


def find_packages_with_homepage(repo_root):
    control_files = []
    for root, dirs, files in os.walk(repo_root):
        for file in files:
            if file == 'control':
                control_files.append(os.path.join(root, file))

    filtered_control_files = []
    for control_file in control_files:
        with open(control_file, 'r') as f:
            contents = f.read()
            if any(line.startswith('Homepage:') for line in contents.splitlines()):
                filtered_control_files.append(control_file)
    return filtered_control_files


def control_to_dict(control_file):
    package_dict = {}
    with open(control_file, 'r') as f:
        lines = f.readlines()
        current_key = None
        for line in lines:
            if not line.isspace() and not line.startswith((' ', '\t')):
                key, value = line.strip().split(':', 1)
                package_dict[key.strip()] = value.strip()
                current_key = key.strip()
            else:
                if current_key is not None:
                    package_dict[current_key] += ' ' + line.strip()
    return package_dict


def get_package_display_name(deb_path: str, package_name: str):
    plugin_name = package_name.split('-', 1)[1]
    json_path = os.path.join(
        deb_path, 'tlweb-marketplace/usr/share/tinyllama/plugin-marketplace', f'{plugin_name}.json')
    if os.path.isfile(json_path):
        with open(json_path, 'r') as f:
            data = json.load(f)
            # The name of the plugin is located at `name`
            if 'name' in data:
                return data['name']
    print(f"Warning: No display name found for package {
          package_name}")
    return plugin_name


def sanitize_version_string(version_str: str):
    version = ""
    for c in version_str:
        if c.isdigit() or c == '.':
            version += c
    return version


def parse_releases_section(section: Tag):
    labelledby = section.get('aria-labelledby')
    version_anchor = section.find(
        'a', href=lambda href: isinstance(href, str) and "/tree/" in href)
    version_tag = ""
    if isinstance(version_anchor, Tag):
        tag = version_anchor.get('href')
        if isinstance(tag, str):
            version_tag = tag.split('/')[-1]
        elif isinstance(tag, list):
            version_tag = tag[0].split('/')[-1]
        else:
            print(f"Unknown type of href in {
                  labelledby}: {type(version_anchor)}")
    else:
        print(f"Could not find version tag in {labelledby}")

    version = sanitize_version_string(version_tag)

    body = section.find('div', class_="markdown-body")
    content = "" if body is None else body.get_text()

    return {
        'version': version if len(version) > 0 else "unknown",
        'content': content
    }


def get_package_releases(homepage):
    if "github.com" not in homepage:
        print(f"Error: Unsupported homepage '{homepage}'")
        return []

    response = requests.get(f"{homepage}/releases")
    if response.status_code == 200:
        soup = BeautifulSoup(response.content, 'html.parser')
        frame = soup.find(id='repo-content-turbo-frame')
        if not isinstance(frame, Tag):
            print("Error: Frame is not of type PageElement")
            return []
        return [parse_releases_section(section) for section in frame.find_all('section')]
    else:
        print(f"Failed to retrieve releases page: {response.status_code}")
        return []


def generate_completion(model, prompt):
    url = "http://localhost:11434/api/generate"
    payload = {
        "model": model,
        "prompt": prompt,
        "stream": False,
        "options": {
            "temperature": 0.7,
            "num_ctx": 4096,
            "num_predict": -1
        }
    }
    headers = {'Content-Type': 'application/json'}
    response = requests.post(url, data=json.dumps(payload), headers=headers)
    # Check if the request was successful (status code 200)
    if response.status_code == 200:
        # Extract and return the generated text from the JSON response
        json_response = response.json()
        # Extracting the response string from the 'response' key
        return json_response['response']
    else:
        print(f"Error: {response.status_code}")


def generate_changelog(name, releases):
    prompt = "Create a concise high-level summary of the changes that may be relevant to an end-user of this product."
    prompt += f"\n\nHere are the releases for {name}: \n" + '\n'.join(
        [f'{release["version"]}:\n{release["content"]}\n' for release in releases])
    return generate_completion("qwen2.5:7b-instruct-q8_0", prompt)


def parse_arguments():
    if len(sys.argv) != 2:
        print(f"Usage: python {sys.argv[0]} <repo_root>")
        sys.exit(1)
    return sys.argv[1]


def validate_deb_path(repo_root):
    deb_path = os.path.join(repo_root, 'debian')
    if not os.path.isdir(deb_path):
        print(f"Error: {deb_path} is not a valid directory.")
        sys.exit(1)
    return deb_path


def check_for_updates(package_dicts):
    package_updates = []
    for package in tqdm(package_dicts):
        releases = get_package_releases(package["Homepage"])

        cur_version = package["Version"]
        if '-' in cur_version:
            cur_version = cur_version.split('-')[1]
        cur_version = Version(cur_version)

        releases = [release for release in releases if Version(
            release["version"]) > cur_version]
        if 0 < len(releases):
            latest_release = max(releases, key=lambda x: Version(x["version"]))

            package_updates += [{
                "name": package["Package"],
                "homepage": package["Homepage"],
                "current": str(cur_version),
                "latest": latest_release["version"],
                "changelog": generate_changelog(package["Package"], releases)}]
    return package_updates


def write_summary(repo_root, package_updates):
    output_dir = os.path.join(repo_root, 'build', 'debian')
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    output_path = os.path.join(output_dir, 'depcheck.txt')
    with open(output_path, 'w') as f:
        f.write(f"Total packages to update: {len(package_updates)}\n")
        for package in package_updates:
            f.write(f"\nName: {package['name']}\n")
            f.write(f"URL: {package['homepage']}/releases\n")
            f.write(f"Current version: {package['current']}\n")
            f.write(f"Latest version: {package['latest']}\n")
            f.write(f"Changelog:\n{package['changelog']}\n")
    return output_path


def write_changelogs(deb_path, package_updates):
    for package in package_updates:
        display_name = get_package_display_name(deb_path, package['name'])
        display_name = display_name.replace(' ', '_')
        file_name = f"{display_name}-{package['latest']}.txt"
        base_path = os.path.join(deb_path, package['name'])
        if not os.path.exists(base_path):
            print(f'Error: {package["name"]} not found at {base_path}')
            continue

        output_dir = os.path.join(
            base_path, 'etc', 'tinyllama', 'patchnotes.d')
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)

        for file in os.listdir(output_dir):
            os.remove(os.path.join(output_dir, file))

        with open(os.path.join(output_dir, file_name), 'w') as f:
            f.write(package['changelog'])


def print_updates(package_updates):
    print(f"\nTotal packages to update: {len(package_updates)}")
    for i, package in enumerate(package_updates):
        print(f"\nPackage {i + 1}:")
        print(f"Name: {package['name']}")
        print(f"URL: {package['homepage']}/releases\n")
        print(f"Current version: {package['current']}")
        print(f"Latest version: {package['latest']}")
        print(f"Changelog:\n{package['changelog']}\n")


def main():
    repo_root = parse_arguments()
    deb_path = validate_deb_path(repo_root)
    package_dicts = [control_to_dict(
        control_file) for control_file in find_packages_with_homepage(deb_path)]
    package_updates = check_for_updates(package_dicts)
    summary_path = write_summary(repo_root, package_updates)
    print_updates(package_updates)
    answer = input(
        "Do you want to update the changelogs for these packages? (y/n): ")
    if answer.lower() == 'y':
        write_changelogs(deb_path, package_updates)
    print(f"A summary of the updates has been written to {summary_path}.")


if __name__ == '__main__':
    main()
