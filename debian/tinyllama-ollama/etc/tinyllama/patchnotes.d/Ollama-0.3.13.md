- **New Safety Models**: 
  - Llama Guard 3: A Meta model for classifying content safety.
  - ShieldGemma: Google DeepMind models to evaluate text prompt and response safety.

- **Default Model Update**:
  - The default model in the quickstart is now set to llama3.2.

- **Issue Fixes**:
  - Fixed a connection issue where `ollama pull` would leave connections when encountering an error.
  - Updated `ollama rm` to stop running models before deleting them.

- **New Go Runner (for Contributors)**:
  - Ollama is transitioning to a new Go-based subprocess model runner for improved reliability and caching. This requires opting-in at build time with changes in the build process.

- **Contributors**:
  - New contributors include @zmldndx, @hidden1nin, and @shifragoldstone.
