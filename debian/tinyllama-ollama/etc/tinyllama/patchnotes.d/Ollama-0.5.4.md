### 0.5.4:
- **New Models:** Added Falcon3, a family of efficient AI models under 10B parameters optimized for science, math, and coding.
- **Bug Fixes:**
  - Fixed issue where providing `null` to format would result in an error.

### 0.5.3:
- **Bug Fixes:**
  - Resolved runtime errors on older Intel Macs.
  - Fixed issue where setting the format field to an empty string (`""`) would cause an error.
- **New Contributor:** @Askir made their first contribution.

### 0.5.2:
- **New Models:** Added EXAONE 3.5, a collection of instruction-tuned bilingual (English and Korean) generative models ranging from 2.4B to 32B parameters.
- **Bug Fixes:**
  - Fixed issue where whitespace would get trimmed from prompts when images were provided.
  - Improved memory estimation during model scheduling.
  - Updated `OLLAMA_ORIGINS` to check hosts in a case-insensitive manner.
- **Directory Change Note:** The Linux installation directory structure has changed. Ensure the new directory layout and contents are retained if manually installing Ollama on Linux.
- **New Contributors:**
  - @yannickgloster
  - @stweil
  - @AidfulAI
  - @taozuhong
  - @philffm

These updates include new models, bug fixes for various issues, and improvements to model scheduling and installation processes.