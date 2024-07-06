
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
- mDNS server auto-discovery support for ease of access using your favorite mobile web browser
- A landing page on port 80 for a 'Home Portal' where all of the web apps can be accessed without memorizing or bookmarking urls
- Premium content that provides a 'robust default experience' for each AI product

Notice: Tiny Llama is primarily geared toward serving home users in a non-commercial/hobbyist context with pre-configured COTS hardware to encourage wide adoption of AI technologies by the general public.

# Tiny Llama AI Home Server

Introducing the Tiny Llama AI Home Server - Your Ultimate Open-Source Generative AI Companion!

<img src="./assets/product-photo-a.png" alt="Tiny Llama AI Home Server 2024" width=200>

Experience the power of cutting-edge image generation and large language models with our affordable, plug-and-play Mini-ITX PC. This open-source solution is perfect for users who are familiar with generative AI technologies like ChatGPT and Midjourney/DALL-E but prefer the privacy and control of local computing and user data storage.

Powered by an AMD Ryzen 5 4600G CPU, an NVIDIA GeForce RTX 3060 GPU with 12GB VRAM, and 16GB of RAM, the Tiny Llama AI Home Server provides a robust and snappy experience for running various consumer-grade AI models without breaking the bank. With a Gen3 PCIe 250GB Solid State Drive (SSD), you'll have ample storage space for your AI models and generated media. Additionally, the Tiny Llama AI Home Server also includes GbE LAN for fast and reliable network connections, optional Intel WiFi+Bluetooth for wireless connectivity, and four SATA3 ports for additional storage devices.

The Tiny Llama AI Home Server offers seamless access to state-of-the-art open-source services like SwarmUI and Open-WebUI, allowing you to generate images and interact with large language models effortlessly. Our comprehensive how-to guides cater to all the services offered by the Tiny Llama AI Home Server, ensuring that you get the most out of your experience.

The Tiny Llama AI Home Server is housed in a 3D printed case, making it compact and easy to integrate into your home or office environment. With mDNS server auto-discovery support, you can easily access the system on your home network using your favorite web browser on any modern device. The tinyllama.local landing page serves as a 'Home Portal' where all of the web apps can be accessed without memorizing or bookmarking URLs.

The setup process is simple - just plug in the device (power + ethernet), turn it on, and navigate to http://tinyllama.local on your PC or mobile device. Additionally, stay on the cutting-edge with effortless continuous easy-to-apply updates for the lifetime of the Tiny Llama product from InsightReactions as newer technologies are made available through open-source channels.

Enjoy the convenience and security of harnessing the capabilities of generative AI on your own terms with the Tiny Llama AI Home Server!

The Tiny Llama AI Home Server costs **$999.99** pre-tax (subject to change), sales starting early **Q3 2024**.

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
  - Each third-party package provided by Tiny Llama has it's own licensing terms. Before attempting to use a specific suite of packages within a commercial context, verify that each module can be used legally within that context. The term "Packages" used here is defined (non-exhaustively) as a software service (Open-WebUI, SwarmUI), machine learning model (Llama3, Hermes2-Theta, SDXL), or plugins (ComfyUI Widgets, LLM Prompts). Use this product commercially at your own risk -- Tiny Llama is primarily geared toward serving home users in a non-commercial/hobbyist context with pre-configured COTS hardware to encourage wide adoption of AI technologies by the general public.
- Tiny Llama Service
  - Some products offered by the Tiny Llama service may request login credentials. Unless otherwise specified, these accounts are created and stored locally on the device. Each service provides it's own mechanisms for user session management and authentication.
  - mDNS service is pre-installed during the [Installation step](#installation) and is required for proper functioning of the http://tinyllama.local url. To uninstall it, you can simply run `sudo apt remove tinyllama-mdns`.
- Tiny Llama Home Server
  - GNOME Location services are enabled by default for system clock timezone sychronization
