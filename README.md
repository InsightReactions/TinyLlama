# Tiny Llama

![Tiny Llama Logo](web/static/android-chrome-192x192.png)

Harness the power of Stable Diffusion Image Generation and robust LLM chat interface for breathtaking image quality and intelligent conversations. Plus, unlock new creative possibilities with LLM-image interoperability. And with the permissive open-source licensing structure, you're in control.

Tiny Llama is a baseline configuration layer on top of Debian:latest, which provides the following value:
- AI WebUI software packages which alleviates the technical experience required to enjoy the latest open-source AI products
- Effortless access to a growing and continuously updating repository of cutting-edge open-source AI technology
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

## Installation

1. Obtain a working system with a fresh installation of Debian 12 (Home or server) that is connected to the internet
2. Run this command to baseline the system: `sudo bash -lc "curl -fsSL https://raw.githubusercontent.com/InsightReactions/TinyLlama/main/debian/os_baseline.sh | bash"`
3. That's it. Enjoy!

## v1.0 Software TODO List

- iOS app does not rediscover the Tiny Llama service when returning to the app after a detection
- Hook up Open WebUI image generation
- Add default Open-WebUI model for better experience for first-time users

## Disclaimers

- Each third-party package provided by Tiny Llama has it's own licensing terms. Before attempting to use a specific suite of packages within a commercial context, verify that each module can be used legally within that context. The term "Packages" used here is defined (non-exhaustively) as a software service (Open-WebUI, StableSwarmUI), machine learning model (Llama3, Hermes2-Theta, SDXL), or plugins (ComfyUI Widgets, LLM Prompts). Use this product commercially at your own risk -- Tiny Llama is primarily geared toward serving home users in a non-commercial/hobbyist context with pre-configured COTS hardware to encourage wide adoption of AI technologies by the general public.
- Tiny Llama Service
  - mDNS service is pre-installed during the [Installation step](#installation) and is required for proper functioning of the Tiny Llama Connector applications (iOS, Android). To uninstall it, you can simply run `sudo apt remove tinyllama-mdns`.
- Tiny Llama Home Server
  - GNOME Location services are enabled by default for system clock timezone sychronization
