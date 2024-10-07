import requests
import json
import os
from packaging.version import Version
from bs4 import BeautifulSoup, Tag


def sanitize_version(tag: str):
    version = ""
    for c in tag:
        if c.isdigit() or c == '.':
            version += c
    return version


class Release:
    def __init__(self, version: Version, commit: str, changelog: str):
        self.verison: Version = version
        self.commit: str = commit
        self.changelog: str = changelog

    @staticmethod
    def from_section(package_name: str, section: Tag) -> 'Release':
        # Get Version
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
                raise ValueError(f"Unknown type of href in {package_name}: {type(version_anchor)}")
        else:
            raise ValueError(f"Could not find version tag in {package_name}")

        # Get commit
        commit_anchor = section.find(
            'a', href=lambda href: isinstance(href, str) and "/commit/" in href)
        commit = ""
        if isinstance(commit_anchor, Tag):
            href = commit_anchor.get('href')
            if isinstance(href, str):
                commit = href.split('/')[-1]
            elif isinstance(href, list):
                commit = href[0].split('/')[-1]
            else:
                raise ValueError(f"Unknown type of href in {package_name}: {type(commit_anchor)}")
        else:
            raise ValueError(f"Could not find commit sha in {package_name}")

        # Get changelog
        body = section.find('div', class_="markdown-body")
        if body is None:
            raise ValueError(f"Could not find changelog in {package_name}")
        content = body.get_text()

        return Release(Version(sanitize_version(version_tag)), commit, content)


class Package:
    def __init__(self, deb_root: str, control_dict: dict):
        name = control_dict['Package']
        if name is None:
            raise ValueError('Control file must have a Package field')

        version = control_dict["Version"]
        if version is None:
            raise ValueError('Control file must have a Version field')

        self.name: str = name
        self.full_version: str = version

        dep_version: str = self.full_version.split(
            '-', 1)[-1] if '-' in self.full_version else self.full_version
        self.dep_version = Version(sanitize_version(dep_version))

        self.homepage: str | None = control_dict.get("Homepage", None)
        self.deb_root = deb_root
        self.deb_path = f"{deb_root}/{self.name}"
        if not os.path.exists(self.deb_path):
            raise FileNotFoundError(
                f'The debian package does not exist at the path: {self.deb_path}')

    @staticmethod
    def from_file(deb_root: str, path: str) -> 'Package':
        package_dict = {}
        with open(path, 'r') as f:
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
        return Package(deb_root, package_dict)


def get_releases(package_name: str, homepage: str) -> list[Release]:
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
        releases = []
        for section in frame.find_all('section'):
            try:
                releases.append(Release.from_section(package_name, section))
            except ValueError as e:
                print("Error:", str(e))
        return releases
    else:
        raise ValueError(f"Failed to retrieve releases page for package {package_name}: {response.status_code}")


def generate_completion(model, prompt) -> str | None:
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
        return None


def generate_changelog(name, releases: list[Release]) -> str | None:
    prompt = "Create a concise high-level summary of the changes that may be relevant to an end-user of this product."
    prompt += f"\n\nHere are the releases for {name}: \n" + '\n'.join(
        [f'{str(release.verison)}:\n{release.changelog}\n' for release in releases])
    return generate_completion("qwen2.5:7b-instruct-q8_0", prompt)


def get_latest_release(package: Package) -> Release | None:
    if not package.homepage:
        raise ValueError(
            f'No homepage found in debian/control for package {package.name}')

    releases = [release for release in get_releases(
        package.name, package.homepage) if release.verison > package.dep_version]
    if 0 < len(releases):
        latest_release = max(releases, key=lambda x: x.verison)
    else:
        return None

    changelog = generate_changelog(package.name, releases)
    if changelog is None:
        print(f"Error: Failed to generate changelog for package {
              package.name}")
        return None

    latest_release.changelog = changelog

    return latest_release
