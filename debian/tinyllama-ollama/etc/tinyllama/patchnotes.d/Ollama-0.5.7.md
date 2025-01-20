### Key Changes from 0.5.7 to 0.5.5:
1. **Model Support:**
   - Added support for importing Command R and Command R+ architectures from safetensors.
   - Introduced new models including Phi-4, OLMo 2, Dolphin 3, SmallThinker, Granite 3.1 Dense, and Granite 3.1 MoE.

2. **API Endpoint Update:**
   - The `/api/create` endpoint has been updated to improve conversion time and now accepts a JSON object.
   - This change is not backwards compatible; ensure you are using version 0.5.5 or later for both Ollama and the ollama CLI when running `ollama create`.

3. **Bug Fixes:**
   - Resolved runtime errors related to filling model context windows.
   - Fixed a crash that occurred with quotes in `/save`.
   - Corrected issues with sending x-stainless headers from OpenAI clients.

### New Contributors:
- @Gloryjaw, @steveberdy, and several others contributed to this release.

These updates enhance functionality, improve performance, and add new models for users. Ensure your setup is updated to the latest version to take advantage of these improvements.