
![Tiny Llama Logo](web/static/android-chrome-192x192.png)

**Useful links**
- [Purchase a Tiny Llama AI Home Server](https://insightreactions.com/store)
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
- mDNS server auto-discovery support for ease of access using your favorite mobile web browser
- A landing page on port 80 for a 'Home Portal' where all of the web apps can be accessed without memorizing or bookmarking urls
- Premium content that provides a 'robust default experience' for each AI product

Notice: Tiny Llama is primarily geared toward serving home users in a non-commercial/hobbyist context with pre-configured COTS hardware to encourage wide adoption of AI technologies by the general public.

# Tiny Llama AI Home Server

Introducing the Tiny Llama AI Home Server - Your Ultimate Open-Source Generative AI Companion!

<img src="./assets/storefront/product-photo-a.png" alt="Tiny Llama AI Home Server 2024" width=200>

Experience cutting-edge image generation and large language models with our affordable, plug-and-play Mini-ITX PC. Designed for users familiar with generative AI technologies like ChatGPT and Midjourney/DALL-E, the Tiny Llama AI Home Server prioritizes privacy and control by keeping your computing and user data storage local.

**Key Features:**
- **Privacy & Control:** Unlike cloud providers, keep all your data and computations on your own device, ensuring maximum privacy and security
- **Powerful Hardware:** AMD Ryzen 5 4600G CPU, NVIDIA GeForce RTX 3060 GPU with 12GB VRAM, and 16GB RAM for robust performance
- **Storage:** 250GB Gen3 PCIe SSD with four SATA3 ports for additional storage
- **Connectivity:** GbE LAN for reliable network connections, optional Intel WiFi+Bluetooth for wireless connectivity
- **Open-Source Software:** Access state-of-the-art open-source services like [SwarmUI](https://github.com/mcmonkeyprojects/SwarmUI) (AI Image Generation) and [Open WebUI](https://github.com/open-webui/open-webui?tab=readme-ov-file#open-webui-formerly-ollama-webui-) (Chat with Large Language Models) seamlessly with Tiny Llama's AI Plugin Dashboard
- **Pre-Installed Models:** Comes with models such as llama3.1-8b (for chat), llava-phi3 (vision model), hermes-2-theta (uninhibited llama3 fine-tune), and stable diffusion models like CyberRealistic V4.2 (SD 1.5) and Dreamshaper XL (SDXL)
- **User-Friendly Setup:** Simple plug-and-play setup with mDNS server auto-discovery and easy local network access via http://tinyllama.local
- **Compact Design:** Housed in a 3D printed case, perfect for any home or office environment
- **Continuous Updates:** Stay updated with effortless, ongoing improvements from InsightReactions and plugin providers at no extra cost.
Harness the power of generative AI on your own terms with the Tiny Llama AI Home Server!

[Explore our comprehensive guides](https://tinyllama.insightreactions.com/guides/) to learn more about Tiny Llama

The **Tiny Llama AI Home Server** starts at $1099.00, **available at the [InsightReactions Store](https://insightreactions.com/store)**.

# Upcoming Additions 

in no particular order and non-exhaustive:
- Speech-to-Text (STT) Support
- Open WebUI - Web Search via Searxng
- Continued support for cutting-edge models
- SwarmUI prompt presets, pre-configured selection of models as a known-good configuration
- Custom ComfyUI Workflows
- How-to Guides
  - LoRAs and how to use them
  - Walkthrough of advanced ComfyUI Workflows
  - LLM Prompting Guide
- Tiny Llama Website (tlweb) plugin add/remove gallery on the device landing page to manage the system configuration
- Civit.ai native integration

# Minimum System Requirements

To run Tiny Llama in it's default-supported configuration:
- CPU: 4-cores or more
- System RAM: at least 16GB
- GPU: NVIDIA GPUs only, 12GB VRAM or higher is necessary to enjoy AI products offered by Tiny Llama's default configuration at full-speed
- Storage: 60GB SSD, 250GB or more is recommended for additional models and to support future functionality
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
  - Each third-party package provided by Tiny Llama has it's own licensing terms. Before attempting to use a specific suite of packages within a commercial context, verify that each module can be used legally within that context. The term "Packages" used here is defined (non-exhaustively) as a software service (Open-WebUI, SwarmUI), machine learning model (Llama3.1, Hermes2-Theta, SDXL), or plugins (ComfyUI Widgets, LLM Prompts). Use this product commercially at your own risk -- Tiny Llama is primarily geared toward serving home users in a non-commercial/hobbyist context with pre-configured COTS hardware to encourage wide adoption of AI technologies by the general public.
- Tiny Llama Service
  - Some products offered by the Tiny Llama service may request login credentials. Unless otherwise specified, these accounts are created and stored locally on the device. Each service provides it's own mechanisms for user session management and authentication.
  - mDNS service is pre-installed during the [Installation step](#installation) and is required for proper functioning of the http://tinyllama.local url. To uninstall it, you can simply run `sudo apt remove tinyllama-mdns`.
- Tiny Llama Home Server
  - GNOME Location services are enabled by default for system clock timezone sychronization
