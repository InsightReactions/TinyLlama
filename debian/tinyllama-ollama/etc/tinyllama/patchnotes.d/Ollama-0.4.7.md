### Key Improvements and New Features:
1. **Tool Support**: Tool calls are now included in streaming responses, improving interaction with external tools.
2. **Model Updates**:
   - **QwQ**: Experimental model by Qwen team for AI reasoning.
   - **Marco-o1**: Open large reasoning model from Alibaba's AIDC-AI.
   - **Tülu 3**: Leading instruction-following model family.
   - **Mistral Large**: New version with improved features.
   - **Qwen 2.5 Coder & OpenCoder**: Updated and new code-focused models.

### User Experience Enhancements:
1. **Performance Improvements**:
   - Fixed crashes on macOS devices with low memory.
   - Improved performance issues in older versions (0.4.0-0.4.2).
   - Fixed hanging caused by KV cache management.

2. **Error Handling**:
   - Ollama now provides errors when submitting SVG images.
   - Redirecting output to a file no longer outputs progress bars or spinners.

3. **Proxy Support**: Improved support for HTTPS_PROXY and HTTP_PROXY environment variables.

### New Features:
1. **NVIDIA Jetson Support**: Ollama can now be installed on NVIDIA Jetson devices, enhancing compatibility with embedded systems.
2. **Index Fields in Chat Endpoints**: Added index fields for tool calls when using chat endpoints like `chat.completions.stream`.

### Contribution Highlights:
- Multiple contributors have made their first contributions to the project, bringing new ideas and fixes.

### Summary of Changes:
- Enhanced tool support and model diversity.
- Improved performance and reliability across different platforms.
- Better error handling and user experience.
- New models and features tailored for specific use cases (e.g., code generation).

These changes aim to make Ollama more robust, versatile, and user-friendly for a wide range of applications.