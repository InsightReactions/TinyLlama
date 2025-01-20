### Summary of Changes for tlweb-open-webui (0.5.4)

#### Added Features:
1. **Clone Shared Chats**: Easily duplicate shared chats.
2. **Native Desktop Notifications**: Receive notifications for channel messages directly on your desktop.
3. **Torch MPS Support**: Enhanced performance and compatibility for AI tasks on Mac.
4. **Enhanced Translations**: Improved translations for a better global user experience.

#### Fixed Issues:
1. **Image-Only Messages in Channels**: Now support sending images without text.
2. **Exception Handling**: Clearer error messages to aid debugging.
3. **RAG Query Generation**: Resolved issues with retrieval accuracy.
4. **MOA Response Functionality**: Addressed errors in response generation.
5. **Channel Thread Loading**: Fixed stalling for threads with over 50 messages.
6. **API Endpoint Restrictions**: Ensured 'API_KEY_ALLOWED_ENDPOINTS' is correctly implemented.
7. **Action Functions**: Restored functionality for customized automations.
8. **Temporary Chat JSON Export**: Resolved export issues.

#### Changed Features:
1. **Sidebar UI Tweaks**: Updated chat folders and "New Folder" button placement.
2. **Real-Time Save Disabled by Default**: Reduced performance impact in high-paced workflows.
3. **Audio Input Echo Cancellation**: Enabled by default for clearer audio interactions.
4. **General Reliability Improvements**: Under-the-hood enhancements for better stability.

### Summary of Changes for tlweb-open-webui (0.5.3)

#### Added Features:
1. **Channel Reactions with Emoji Picker**: Easily add reactions to channel messages using a built-in emoji picker.
2. **Threads for Channels**: Organize discussions within channels.
3. **Reset Button for SVG Pan/Zoom**: Quickly reset diagrams or visuals.
4. **Realtime Chat Save Environment Variable**: Choose between faster responses and data persistence.

#### Fixed Issues:
1. **Ollama Parameters**: Ensured input parameters are respected.
2. **Function Plugin Outlet Hook Reliability**: Improved operation within custom extensions.
3. **Custom Status Descriptions**: Corrected formatting for user statuses.
4. **API Functionality**: Restored APIs for certain configurations.
5. **Custom Pipe Function Completion**: Fixed chat workflow issues.

#### General Enhancements:
1. **Translation Updates**: Improved translations across multiple languages.
2. **Documentation**: Expanded and clarified documentation on functions, including migration instructions.