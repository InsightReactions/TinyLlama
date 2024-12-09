**Major Updates:**
1. Added support for Alimama Flux Inpaint and ControlNet, BFL's Flux Tools (including Redux, Canny, Depth, Fill), Genmo Mochi 1 Text-To-Video, SD 3.5 Large & Medium models with controlnets, Lightricks LTX-Video text2video & image2video.
2. Introduced a 'prompt add button' for easier use of advanced prompt syntax like Segment or Region.

**Minor Updates:**
1. Enhanced UI features including a delay option in user settings and improved model downloading.
2. Added VAE Tile Overlap parameter, better error detection, and automatic Flux/SD35 VAE autodownload.
3. Improved image metadata format and added a Copy Raw Metadata button for images.
4. Updated documentation with pictures to illustrate prompt syntax and model support.

**Security Notice:**
- A security breach occurred on 2024-12-05 where a version of the "Ultralytics" python package containing crypto-miner malware was marked as latest on pip. This affected Linux and Mac users who installed Swarm or manually updated Python packages that day, especially if they used YOLO models.
- Affected users should kill the ultralytics process and delete the executable to mitigate the issue.

For more detailed information, refer to the official documentation and [release notes](https://github.com/mcmonkeyprojects/SwarmUI/releases/tag/0.9.4.0-Beta).