
![Tiny Llama Logo](web/static/android-chrome-192x192.png)

**Useful links**
- [Tiny Llama User Guides](https://tinyllama.insightreactions.com/guides)
- [Debian Repository](https://github.com/InsightReactions/debian.insightreactions.github.io)
- [Model Repository](https://huggingface.co/InsightReactions/TinyLlama)

**Table of Contents**
- [About Tiny Llama](#about-tiny-llama)
- [Tiny Llama AI Home Server](#tiny-llama-ai-home-server)
- [Upcoming Additions](#upcoming-additions)
- [Minimum System Requirements](#minimum-system-requirements)
- [Installation](#installation)
- [Disclaimers](#disclaimers)

# About Tiny Llama

Harness the power of Stable Diffusion Image Generation and robust LLM chat interface for breathtaking image quality and intelligent conversations. Plus, unlock new creative possibilities with LLM-image interoperability. And with the permissive open-source licensing structure, you're in control.

Tiny Llama is a baseline configuration layer on top of Debian:latest, which provides the following value:
- Pre-packaged AI WebUI software which alleviates the technical experience required to use the latest open-source AI products and can be enjoyed on any device with appropriate aspect ratio displays (per-product basis).
- Effortless access to a growing and continuously updating repository of cutting-edge open-source AI technologies
- mDNS server auto-discovery support paired with iOS/Android apps for ease of access using your favorite mobile web browser
- A landing page on port 80 for a 'Home Portal' where all of the web apps can be accessed without memorizing or bookmarking urls
- Premium content that provides a 'robust default experience' for each AI product such as:
  - [User How-to Guides](https://tinyllama.insightreactions.com/guides)
  - LLM
    - Prompt Presets
    - Virtual Characters
    - A compelling 'default personality'
    - Hand-picked selection of LLMs to get started
  - Image Generation
    - Prompt Presets
    - Hand-picked selection of Stable Diffusion Models and LoRAs
    - Pre-installed Third-Party ComfyUI Widgets
    - Powerful ComfyUI Workflow presets for upscaling, inpainting, consistent characters, etc
  - And much more

Notice: Tiny Llama is primarily geared toward serving home users in a non-commercial/hobbyist context with pre-configured COTS hardware to encourage wide adoption of AI technologies by the general public.

# Tiny Llama AI Home Server

The Tiny Llama AI Home Server is an **affordable pre-configured Mini-ITX PC** that is **100% open source** and **designed for non-technical users** who are familiar with generative AI technologies but prefers the privacy of local computing and user data storage. 

It's a plug-and-play solution that allows you to easily host your own Tiny Llama server without the need for technical expertise. The Tiny Llama AI Home Server is built using off-the-shelf PC components and is based on Debian Linux, making it simple to upgrade and maintain -- or repurpose as desired for those more technically-inclined users.

The hardware is capable of generating **55 tokens per second with Meta's Llama3-8b** (comparable with ChatGPT-3.5 speeds) and supports loading any AI model that is both adequately supported by the RAM/VRAM of the device and the desired AI service (Open WebUI, SwarmUI, etc). In practice, this means to **expect to be able to run 8b-13b parameter LLMs and comparable diffusion models**. Currently, the hardware requirements for intelligent AI systems are *decreasing*, which means this hardware will be able to run increasingly more performant models without needing to replace any PC components for the forseeable future. These gains can be deployed to all Tiny Llama users at no cost through Tiny Llama's update functionality on the device's home page.

Paired with the Tiny Llama Connector mobile app, the setup process to install the Tiny Llama AI Home Server is as easy as plugging in the device (power + ethernet), turning it on, and launching the Tiny Llama Connector app on your iOS or Android device.

Specifications:
- CPU: AMD Ryzen 5 4600G, 6-Core, 12-Thread
- GPU: GeForce RTX 3060 12GB
- MOBO: Gigabyte A520I AC (Mini-ITX/Direct 6 Phases Digital PWM with 55A DrMOS/Gaming GbE LAN/Intel WiFi+Bluetooth/NVMe PCIe 3.0 x4 M.2/3 Display Interfaces)
- PSU: SFX, 450W
- RAM: 16GB
- Storage: NAND SSD, 256GB
- Case: PETG Mini-ITX Tiny Llama branded MODCASE, Dark Gray

The Tiny Llama AI Home Server costs **$999.99** pre-tax, sales starting early **Q3 2024**.

# Upcoming Additions 

in no particular order and non-exhaustive:
- Speech-to-Text (STT) Support
- Open WebUI - Web Search via Searxng
- Continued support for cutting-edge models
- SwarmUI prompt presets, pre-configured selection of models as a known-good configuration
- How-to Guides
  - LoRAs and how to use them
  - Walkthrough of advanced ComfyUI Workflows provided by tinyllama-plus
  - LLM Prompting Guide
- Tiny Llama Website (tlweb) plugin add/remove gallery on the device landing page to manage the system configuration
- Civit.ai native integration

# Minimum System Requirements

To run Tiny Llama in it's default-supported configuration:
- CPU: 4-cores or more
- System RAM: at least 16GB
- GPU: NVIDIA GPUs only, 12GB VRAM or higher is necessary to enjoy AI products offered by Tiny Llama's default configuration at full-speed
- Storage: SSD, 250GB or more is recommended
- Wired internet connectivity during setup, wired LAN connectivity afterwards

Notice: Systems that utilize the Tiny Llama service offered by InsightReactions are maintained based on this premise and the Debian package configuration. Deviate from the baseline configuration at your own risk. Precautionary measures will be taken to reduce unintended secondary effects from updates but we cannot provide any guarantees of system stability when deviation from the system baseline occurs.

# Installation

1. Obtain a working system with a fresh installation of Debian 12 (Home or server) that is connected to the internet
2. Run this command to baseline the system: `sudo bash -lc "curl -fsSL https://raw.githubusercontent.com/InsightReactions/TinyLlama/main/debian/os_baseline.sh | bash"`
3. Reboot
4. The Tiny Llama landing page can be accessed at http://tinyllama.local on any modern device that supports mDNS. Alternatively, the IP address of the server may be retrieved by: 
   - Running this command on a Linux PC with *avahi-utils* installed: `avahi-browse -art | grep -a2 "Tiny Llama" | grep address | cut -d'[' -f2 | cut -d']' -f1`
   - Running the command `ip addr` on the Tiny Llama device and looking for the IP address with the appropriate subnet. Once the IP is retrieved, the landing page can be accessed with the following template: `http://<IP_ADDRESS>` 
5. That's it. Enjoy! Feel free to bookmark each web service in your favorite browsers on all of your home devices for maximal ease of access.

# Disclaimers

- Licensing
  - Each third-party package provided by Tiny Llama has it's own licensing terms. Before attempting to use a specific suite of packages within a commercial context, verify that each module can be used legally within that context. The term "Packages" used here is defined (non-exhaustively) as a software service (Open-WebUI, SwarmUI), machine learning model (Llama3, Hermes2-Theta, SDXL), or plugins (ComfyUI Widgets, LLM Prompts). Use this product commercially at your own risk -- Tiny Llama is primarily geared toward serving home users in a non-commercial/hobbyist context with pre-configured COTS hardware to encourage wide adoption of AI technologies by the general public.
- Tiny Llama Service
  - Some products offered by the Tiny Llama service may request login credentials. Unless otherwise specified, these accounts are created and stored locally on the device. Each service provides it's own mechanisms for user session management and authentication.
  - mDNS service is pre-installed during the [Installation step](#installation) and is required for proper functioning of the Tiny Llama Connector applications (iOS, Android). To uninstall it, you can simply run `sudo apt remove tinyllama-mdns`.
- Tiny Llama Home Server
  - GNOME Location services are enabled by default for system clock timezone sychronization
