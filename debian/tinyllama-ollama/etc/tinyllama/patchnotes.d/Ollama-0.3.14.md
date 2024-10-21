**New Model Support:**
- **Granite 3 MoE:** IBM's 1B and 3B models optimized for low latency.
- **Granite 3 Dense:** IBM's 2B and 8B models designed for tool-based use cases, supporting RAG, code generation, translation, and bug fixing.

**Improvements:**
- Fixed crashes on AMD GPUs with small system memory.
- Resolved an error occurring on macOS 11 Big Sur.
- Addressed issues with model creation from bf16 file types.
- Enhanced CPU performance by optimizing default thread counts.
- Added IBM granite/granitemoe architecture support.

**Contributors:**
- First contributions from @JHubi1 and @gabe-l-hart.