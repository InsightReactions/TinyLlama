### New Features and Models:
- **Model Updates:** 
  - Added Llama 3.3 (70B), which offers similar performance to Llama 3.1 405B.
  - Introduced Snowflake Arctic Embed 2, a multilingual embedding model with improved English performance.

- **Structured Outputs:**
  - Ollama now supports structured outputs using JSON schema for constraints.
  - This feature is available via REST API and both Python and JavaScript libraries.

### Improvements:
- Fixed issues in generating JSON output when formatting was set to `null`.
- Resolved errors related to importing model vocabulary files.
- Added experimental support for KV cache quantization (4-bit, 8-bit, or 16-bit) to reduce VRAM requirements for longer context windows. This can be enabled globally with environment variables.

### Community Contributions:
- New contributors (@dmayboroda, @Geometrein, and @owboson) made their first contributions in this release cycle.

These changes enhance the functionality and performance of tinyllama-ollama, particularly focusing on improved model support, structured output capabilities, and optimization for VRAM usage.