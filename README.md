# Tiny Llama

![Tiny Llama Logo](web/static/android-chrome-192x192.png)

[Debian Repository](https://github.com/InsightReactions/debian.insightreactions.github.io)

Harness the power of Stable Diffusion Image Generation and robust LLM chat interface for breathtaking image quality and intelligent conversations. Plus, unlock new creative possibilities with LLM-image interoperability. And with the permissive open-source licensing structure, you're in control.

Tiny Llama is a baseline configuration layer on top of Debian:latest, which provides the following value:
- Pre-packaged AI WebUI software which alleviates the technical experience required to use the latest open-source AI products and can be enjoyed on any device with appropriate aspect ratio displays (per-product basis).
- Effortless access to a growing and continuously updating repository of cutting-edge open-source AI technologies
- mDNS server auto-discovery support paired with iOS/Android apps for ease of access using your favorite mobile web browser
- A landing page on port 80 for a 'Home Portal' where all of the web apps can be accessed without memorizing or bookmarking urls
- Pre-installed Premium content (TBA;TBD) that provides a 'robust default experience' for each AI product such as:
  - How-to Guides
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

## Upcoming Additions

- Continued support for cutting-edge models
- Virtual Girlfriend Open-WebUI Modelfile (codenamed: Sarah)
- StableSwarmUI prompt presets, pre-configured selection of models as a known-good configuration
- How-to Guides
  - LoRAs and how to use them
  - Walkthrough of advanced ComfyUI Workflows provided by tinyllama-plus
  - The differences between the provided model selections with tinyllama-default and tinyllama-plus
  - LLM Prompting
  - TinyLlama technical install guide
- Tiny Llama Website (tlweb) plugin add/remove gallery on the device landing page to manage the system configuration
- Civit.ai native integration

## Minimum System Requirements

To run Tiny Llama in it's default-supported configuration:
- CPU: 4-cores or more
- System RAM: at least 16GB
- GPU: NVIDIA GPUs only, 12GB VRAM or higher is necessary to enjoy AI products offered by Tiny Llama's default configuration at full-speed
- Storage: SSD, 250GB or more is recommended
- Wired internet connectivity during setup, wired LAN connectivity afterwards

Notice: Systems that utilize the Tiny Llama service offered by InsightReactions are maintained based on this premise and the Debian package configuration. Deviate from the baseline configuration at your own risk. Precautionary measures will be taken to reduce unintended secondary effects from updates but we cannot provide any guarantees of system stability when deviation from the system baseline occurs.

## Installation

1. Obtain a working system with a fresh installation of Debian 12 (Home or server) that is connected to the internet
2. Run this command to baseline the system: `sudo bash -lc "curl -fsSL https://raw.githubusercontent.com/InsightReactions/TinyLlama/main/debian/os_baseline.sh | bash"`
3. The Tiny Llama landing page can be accessed at http://localhost on the device. The IP address of the server may be retrieved by: 
   - The browser url after using the mobile app *Tiny Llama Connector* (iOS/Android) to navigate to the landing page
   - Running this command on a Linux PC with *avahi-utils* installed: `avahi-browse -art | grep -a2 "Tiny Llama" | grep address | cut -d'[' -f2 | cut -d']' -f1`
   - Running the command `ip addr` on the Tiny Llama device and looking for the IP address with the appropriate subnet. Once the IP is retrieved, the landing page can be accessed with the following template: `http://<IP_ADDRESS>` 
4. That's it. Enjoy! Feel free to bookmark each web service in your favorite browsers on all of your home devices for maximal ease of access.

## v1.0 Software TODO List

- iOS app does not rediscover the Tiny Llama service when returning to the app after a detection
- Hook up Open WebUI image generation
- Add default Open-WebUI model for better experience for first-time users

## Disclaimers

- Licensing
  - Each third-party package provided by Tiny Llama has it's own licensing terms. Before attempting to use a specific suite of packages within a commercial context, verify that each module can be used legally within that context. The term "Packages" used here is defined (non-exhaustively) as a software service (Open-WebUI, StableSwarmUI), machine learning model (Llama3, Hermes2-Theta, SDXL), or plugins (ComfyUI Widgets, LLM Prompts). Use this product commercially at your own risk -- Tiny Llama is primarily geared toward serving home users in a non-commercial/hobbyist context with pre-configured COTS hardware to encourage wide adoption of AI technologies by the general public.
- Tiny Llama Service
  - Some products offered by the Tiny Llama service may request login credentials. Unless otherwise specified, these accounts are created and stored locally on the device. Each service provides it's own mechanisms for user session management and authentication.
  - mDNS service is pre-installed during the [Installation step](#installation) and is required for proper functioning of the Tiny Llama Connector applications (iOS, Android). To uninstall it, you can simply run `sudo apt remove tinyllama-mdns`.
- Tiny Llama Home Server
  - GNOME Location services are enabled by default for system clock timezone sychronization
