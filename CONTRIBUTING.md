 # Contributing

## Table of Contents

- [Contributing](#contributing)
  - [Table of Contents](#table-of-contents)
  - [How to Contribute](#how-to-contribute)
    - [1. Before You Start](#1-before-you-start)
    - [2. Suggesting Enhancements](#2-suggesting-enhancements)
    - [3. Reporting Bugs](#3-reporting-bugs)
    - [3. Contributing Code](#3-contributing-code)
  - [Project Structure](#project-structure)
  - [Project Deployment](#project-deployment)


## How to Contribute

We welcome suggestions and bug reports! Here's how you can contribute to our project.

### 1. Before You Start

- **Check Issues**: Look through the [issues](https://github.com/InsightReactions/TinyLlama/issues) to see if your idea or bug has already been suggested or reported. If it has, add a reaction to the issue to show your support.
- **Search Documentation**: Check our [documentation](https://tinyllama.insightreactions.com) for answers before opening an issue.

### 2. Suggesting Enhancements

We welcome suggestions and ideas! Here's how you can suggest enhancements:

1. Open a new issue.
2. Provide a clear and concise description of your idea.
3. Explain why this enhancement would be useful to our project.
4. If possible, include screenshots or mockups to illustrate your suggestion.

### 3. Reporting Bugs

If you find a bug in the project, please tell us about it! Here's how:

1. Open a new issue.
2. Provide a clear and concise description of what the bug is.
3. Describe the steps to reproduce the issue.
4. Provide screenshots or code snippets if available.
5. Specify the operating system, browser, and version you are using.

### 3. Contributing Code

Contributions are accepted on a case-by-case basis, determined by the project maintainers and InsightReactions based on the desired direction of the project. Before forking, consider a feature request to see if we're interested!

Here's how to contribute code:

1. Fork the repository
2. Create a new feature branch
3. Make your changes while conforming to existing standards present in the project
4. Commit your changes and push the branch
5. Perform an integration test with a live system to ensure the modifications work as intended
6. Open a Pull Request

## Project Structure

Here's an explanation of the main components:

1. **Assets**: This folder contains various image files used in the project, such as logos and product photos.

2. **Debian**: This directory contains a collection of scripts and configurations related to Debian package management. Each subdirectory represents a separate Debian package for different AI plugins and configurations for the Tiny Llama AI Home Server. Here's an explanation of some of the main Debian packages:
   1. **tinyllama**: This package sets up and configures the Tiny Llama Local Dashboard. It includes a systemd service file (`tinyllama.service`) to manage the server's lifecycle.

   2. **tinyllama-mdns**: This package provides mDNS (multicast DNS) server support for auto-discovery, allowing devices on the same network to easily find and connect to the Tiny Llama AI Home Server. It includes an Avahi service file (`tinyllama-mdns.service`) for mDNS configuration.

   3. **tinyllama-ollama**: This package installs Ollama, a language model runtime that enables running large language models locally on consumer-grade hardware. The systemd service file (`ollama.service`) is used to manage the Ollama service lifecycle.

   4. **tinyllama-openedai-speech**: This package reproduces OpenAI's text-to-speech (TTS) service functionality, via coqui-XTTS, allowing users to convert text into speech using various voices and configurations. It includes a systemd service file (`openedai-speech.service`) for managing the TTS service and a configuration file (`voice_to_speaker.yaml`) that maps voices to speakers.

   5. **tlweb-amica**: This package installs Amica, an open-source virtual character service. It includes a systemd service file (`amica.service`) for managing the Amica server and the necessary files and directories for running Amica.

   6. **tlweb-langflow**: This package installs LangFlow, a visual development environment for building and deploying AI applications using a drag-and-drop interface. It includes a systemd service file (`langflow.service`) for managing the LangFlow server and a run script (`run.sh`) for starting the LangFlow application.

   7. **tlweb-marketplace**: This package sets up and configures the Tiny Llama Marketplace, which allows users to easily discover, install, and manage AI tools and services on their Tiny Llama Local Dashboard. It includes JSON files for each available tool or service in the marketplace to serve as a mapping between the local dashboard and 3rd-party applications.

   8. **tlweb-open-webui**: This package installs Open WebUI, a web-based user interface that provides access to various AI tools and services on the Tiny Llama AI Home Server. It includes a systemd service file (`open-webui.service`) for managing the Open WebUI server.

   9.  **tlweb-stable-diffusion-webui**: This package installs Stable Diffusion WebUI, an open-source web-based user interface for running Stable Diffusion, a powerful text-to-image generation model. It includes a systemd service file (`stable-diffusion-webui.service`) for managing the Stable Diffusion WebUI server.

   10. **tlweb-swarmui**: This package installs SwarmUI, an open-source web-based user interface that allows users to run Comfy UI, a popular text-to-image generation tool, on their Tiny Llama AI Home Server. It includes a systemd service file (`swarmui.service`) for managing the SwarmUI server.

   Each Debian package is designed to install, configure, and manage its respective component or feature independently, allowing users to customize their Tiny Llama AI Home Server by selecting which packages they want to install. This modular approach ensures that the system remains lightweight and adaptable to various hardware configurations and user preferences.

   There are also 

3. **Tools**: A folder containing additional tools or utilities used in the project. In this case, it primarily includes 'depcheck' for automatically checking and updating third-party Debian project dependencies to maintain the update lifecycle for Tiny Llama packages.

4. **Web**: This directory contains files related to the Tiny Llama Local Dashboard, such as Python scripts (app.py), Gunicorn configuration file, requirements file, static assets like CSS and JavaScript files, and an HTML index file. To run a copy locally, simply ensure `python3` is available, and run `web/run.sh`.

Overall, this project is a modular and extensible system designed to provide a user-friendly interface for managing various AI tools and services on an AI home server. The Debian package management structure ensures that individual components can be easily installed, updated, or removed as needed, which is beneficial for maintaining the system's integrity and ease of use.

## Project Deployment

The `debian/` directory contains several Bash shell scripts (`.sh`) that are used for building, deploying, and managing Debian packages related to the Tiny Llama AI Home Server project. Here's an explanation of each script:

1. **[build.sh](debian/build.sh)**: This script is responsible for creating a Debian package from a source directory. It takes one argument, which is the name of the package folder that contains a `DEBIAN` subdirectory and a control file (usually named `control`). The script verifies the existence of the package and copies it to a build directory. If the package being built is "tinyllama", it also syncs the contents of the project's web directory into the build directory. After that, it sets appropriate permissions on the DEBIAN folder and uses `dpkg-deb` to create a binary Debian package.

2. **[deploy.sh](debian/deploy.sh)**: This script automates the process of building and deploying packages to a Debian repository. It takes two arguments: the release type (testing or stable) and one or more package names, separated by commas if there are multiple packages. The script first verifies that the package exists in the directory and then runs `build.sh` to create the Debian package. After successfully building the package, it copies the generated `.deb` file to the appropriate location in the Debian repository and recompiles the repository with the updated or new package. Finally, it prompts the user to commit and push changes to the repository if they choose to do so. This requires to proper SSH key configuration for deployment to the debian Repository. Please contact the maintainer if you want to deploy a new version of a product.

3. **[os_baseline.sh](debian/os_baseline.sh)**: This script is designed for post-operating system setup tasks, such as preparing and securing a Debian-based operating system. It checks whether the script is run with superuser privileges (root) and then prompts the user to baseline the operating system or skip this step. If baselining is selected, the script performs several actions:
	* Disables sleep modes using `systemctl mask`
	* Sets the default theme to Dark using GNOME settings
	* Updates package repository sources and installs necessary drivers (NVIDIA)
	* Installs Docker and NVIDIA Container Toolkit for GPU acceleration
	* Configures xrdp user to allow secure connections
	* Adds the InsightReactions repository, updates the package index, and installs specified packages (tinyllama, tinyllama-mdns, tinyllama-ollama, tlweb-open-webui, tlweb-swarmui)

4. **[os_test.sh](debian/os_test.sh)**: This script is used for testing the Tiny Llama AI Home Server baseline on a remote system. It first checks if `avahi-browse` is installed (used for service discovery). If not, it installs Avahi and its daemon. Next, it syncs `os_baseline.sh` to the remote system's `/tmp` directory and opens a web browser with the IP address of the remote server. After that, it runs `os_baseline.sh` on the remote system using SSH with superuser privileges. Finally, it uses Avahi service discovery to detect the Tiny Llama Server and print its IP address.

These shell scripts help automate various aspects of building, deploying, testing, and managing Debian packages for the Tiny Llama AI Home Server project. They provide a more streamlined experience for users and developers while ensuring that the system remains secure and up-to-date with the latest software releases.