# TinyLlama

Harness the power of Stable Diffusion Image Generation and robust LLM chat interface for breathtaking image quality and intelligent conversations. Plus, unlock new creative possibilities with LLM-image interoperability. And with the permissive open-source licensing structure, you're in control.

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
- Tiny Llama Website (tlweb) plugin add/remove gallery

## v1.0 Software TODO List

- iOS app does not rediscover the Tiny Llama service when returning to the app after a detection
- Hook up Open WebUI image generation
- Add default Open-WebUI model for better experience for first-time users

## Disclaimers

- Each third-party package provided by Tiny Llama has it's own licensing terms. Before attempting to use a specific suite of packages within a commercial context, verify that each module can be used legally within that context. The term "Packages" used here is defined (non-exhaustively) as a software service (Open-WebUI, StableSwarmUI), machine learning model (Llama3, Hermes2-Theta, SDXL), or plugins (ComfyUI Widgets, LLM Prompts). Use this product commercially at your own risk -- Tiny Llama is primarily geared toward serving home users in a non-commercial/hobbyist context with pre-configured COTS hardware to encourage wide adoption of AI technologies by the general public.
- To install tlweb-open-webui, [docker-ce needs to be installed as a package](https://docs.docker.com/engine/install/ubuntu/#install-using-the-repository)
- Tiny Llama Home Server
  - GNOME Location services are enabled by default for system clock timezone sychronization
  - mDNS service is required for proper functioning of the Tiny Llama Connector applications (iOS, Android)
