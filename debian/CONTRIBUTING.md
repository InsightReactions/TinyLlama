# tlweb Plugin Design Requirements

1. The package name for the debian file must correspond to a systemd service file, for instance, the debian package name `tlweb-PLUGIN` must have a systemd service file at `/etc/systemd/system/PLUGIN.service`. Substitute `PLUGIN` with the plugin name everywhere it appears in this article.
2. The debian package `control` file should contain a user-friendly description. View the [Debian documentation](https://www.debian.org/doc/debian-policy/ch-controlfields.html#description) for more information on what is allowed.
3. The systemd service must be able to start and stop the service.
4. The plugin installation (downloading of dependencies, running scripts) should be performed in the `PLUGIN/DEBIAN/postinst` script.
5. The installation of the plugin which contains the bin directory should be located in a subdirectory under `/srv/www/` and identified appropriately, such as `/srv/www/PLUGIN`.
6. Generated runtime data should stay contained to the respective `/srv/www/` folder, or `/tmp`, where possible. In the `postrm` script, warn the system user of the existence of user data and how to remove it, if desired, through an echo to stdout. Do not automatically remove data which may be useful for the user, such as images, or user profile data that may be re-used during a backup/restoration process.
7. Bulk source data that may be referenced occasionally, such as a manual, template, or baseline configuration, can be stored in subdirectory under `/usr/share/`, named after the plugin identifier, like `/usr/share/PLUGIN`.
8. a json file in `<REPO_ROOT>/debian/tlweb-marketplace/usr/share/tinyllama/plugin-marketplace/PLUGIN.json` with the following format:
```json
{
    "package": "tlweb-PLUGIN",
    "name": "My Plugin Name",
    "description": "My short and user-friendly plugin description. No more than 140 chars.",
    "port": -1
}
```
9.  A user-friendly PNG logo must be included in the plugin-marketplace folder (refer back to step 8 for the path), measuring 64x64 px, and located at `plugin-marketplace/PLUGIN.png`. This image will be displayed on the landing page for each respective plugin.

# To Add a New tlweb Plugin

1. Copy debian package structure `tlweb-skel`, updating each property for every file/directory accordingly -- be sure to replace `skel` where it occurs with the new plugin name.
2. Add the required files to the plugin-marketplace folder, as described in step 8 in section ["tlweb Plugin Design Requirements"](#tlweb-plugin-design-requirements).
3. Perform independent testing to ensure a quality deliverable
4. Open a pull request, await approval and final integration testing
