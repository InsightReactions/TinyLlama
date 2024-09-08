// GLOBALS
var checkUpgradeIntervalId = undefined;
var newPatchDate = new Date(localStorage.getItem("lastPatchDate"));
var refreshOnClose = false;
var updateUpgradeStatusRunning = false;
var lastUpdateLogs = [];
const upgradeWaitingContainer = document.getElementById('upgrade-waiting-container');
const upgradeResultsContainer = document.getElementById('upgrade-results-container');
const patchnotesContainer = document.getElementById('patchnotes-container');
const updateModal = document.getElementById('update-modal');
const updateButton = document.getElementById('update-button');
const reclaimVramButton = document.getElementById('reclaim-vram-button');
const pluginBrowserContainer = document.getElementById('plugin-browser-container');
const vramProgressBar = document.getElementById('vram-progress-bar');
const removeCancelButton = document.getElementById('remove-cancel-button');
const removeConfirmButton = document.getElementById('remove-confirm-button');
const upgradeStatusElement = document.getElementById('upgrade-status');

// FUNCTIONS
/**
 * Fetches patch notes from the server and displays them in a container.
 *
 * This function sends a GET request to '/patchnotes' endpoint with 'since' query parameter set to the last known patch date,
 * expects a JSON response containing an array of patch note objects each with 'filename', 'content', and 'creationTime' properties.
 * For each patch note object, it creates a header element with the name of the update (derived from filename) and a textarea to display the content.
 * If there are no new patch notes, it displays a message indicating that the system update is complete.
 * It also handles errors by logging them to console.
 *
 * @function fetchPatchnotes
 * @param {boolean} showSystemOnlyUpdates - Whether to display for system updates only or not.
 */
function fetchPatchnotes(showSystemOnlyUpdates) {
    fetch(`/patchnotes?since=${localStorage.getItem("lastPatchDate")}`)
        .then(response => response.json())
        .then(data => {
            if (!data || !data.patchnotes) {
                console.info('No data returned from server.');
                return;
            }

            // clear patchnotes section
            while (patchnotesContainer.firstChild) {
                patchnotesContainer.removeChild(patchnotesContainer.firstChild);
            }

            const patchnotes = data.patchnotes; // type [{filename: string, content: string, creationTime: string}]

            if (patchnotes.length > 0) {
                patchnotes.forEach((item) => {
                    const header = document.createElement('h2');
                    const filenameParts = item.filename.split('-'); // Split the string at '-'
                    const version = filenameParts[1].substring(0, filenameParts[1].lastIndexOf('.')); // Extract the version number from the second part of the split string
                    const headerText = `${filenameParts[0].replace('_', ' ')} v${version}`; // Replace '_' with ' ', and construct the final string
                    header.textContent = headerText;
                    header.style.alignSelf = "start";

                    const textarea = document.createElement('textarea');
                    textarea.title = "Patch Notes";
                    textarea.textContent = item.content;
                    textarea.style.width = '100%';
                    textarea.style.height = '400px'; // Adjust the height as needed for your design
                    textarea.style.marginBottom = '12px'; // Add some space below each textarea
                    textarea.readOnly = true;

                    patchnotesContainer.appendChild(header);
                    patchnotesContainer.appendChild(textarea);
                });

                newPatchDate = new Date(patchnotes[0].creationTime);
            } else {
                const p = document.createElement('p');
                p.textContent = "System update complete. No additional patch notes are available."
                patchnotesContainer.appendChild(p);
            }

            if (patchnotes.length > 0 || showSystemOnlyUpdates) {
                // Show the patch notes
                upgradeWaitingContainer.style.display = 'none';
                upgradeResultsContainer.style.display = 'flex';
                updateModal.style.display = 'flex';
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

/**
 * Generates completion for given model and prompt using Ollama API.
 *
 * This function sends a POST request to 'http://127.0.0.1:11434/api/generate' with provided model, prompt, and options in the request body.
 * It expects a streaming response where each chunk contains a JSON object with completion data. The function yields these objects one by one as they arrive.
 * If there is an error during the fetch operation, it throws an Error with the HTTP status text.
 *
 * @async
 * @function generateCompletion
 * @param {string} model - The name of the language model to use for generation.
 * @param {string} prompt - The input text to generate completion for.
 * @param {Object} [options={}] - Additional options to include in the request body.
 * @throws {Error} Throws an error if the HTTP response status is not OK.
 * @yields {Object} Yields JSON object with completion data as they arrive in the streaming response.
 */
async function* generateCompletion(model, prompt, options = {}) {
    const url = 'http://' + window.location.hostname + ':11434/api/generate';
    const data = { model, prompt, ...options };

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');

    while (true) {
        const { done, value } = await reader.read();

        if (done) {
            break;
        }

        yield JSON.parse(decoder.decode(value));
    }
}

/**
 * Fetches the last n lines of journal logs related to tinyllama-upgrade.
 *
 * @async
 * @function fetchUpgradeLog
 * @param {number} n - The number of log entries to retrieve.
 * @returns {Promise<string[]>} A promise that resolves with an array of string representing the last n lines of the logs
 */
async function fetchUpgradeLog(n) {
    try {
        const response = await fetch(`/logs/tinyllama-upgrade/${n}`);
        if (!response.ok) {
            throw new Error('Failed to fetch upgrade logs: ' + response.statusText);
        }
        const data = await response.json();
        return data.logs;
    } catch (error) {
        console.error('Error while fetching upgrade logs:', error.message);
    }
}

/**
 * Updates the upgrade status element with a new completion.
 *
 * @async
 * @function updateUpgradeStatus
 */
async function updateUpgradeStatus() {
    if (updateUpgradeStatusRunning) {
        return;
    }

    updateUpgradeStatusRunning = true;

    let response = '';
    try {
        const journalLogs = await fetchUpgradeLog(5);
        if (lastUpdateLogs.length === 0 || JSON.stringify(lastUpdateLogs) !== JSON.stringify(journalLogs)) {
            lastUpdateLogs = journalLogs;

            const prompt = `Respond with a concise and attention-grabbing phrase from the following journalctl logs that gives a snapshot of system status for a loading screen. Provide only the selected phrase, followed by an ellipsis (...). Do not enclose the phrase in quotes. Logs: ${lastUpdateLogs.join('\n')}`;
            const options = { max_tokens: 15, keep_alive: '1m', stream: false };

            for await (const part of generateCompletion('llama3.1', prompt, options)) {
                response += part.response;
                upgradeStatusElement.textContent = response;
                if (part.done) {
                    break;
                }
            }
        }
    } catch (error) {
        console.error('Error while fetching upgrade phrase:', error.message);
        lastUpdateLogs = [];
    }

    updateUpgradeStatusRunning = false;
}

/**
 * Checks system upgrade status and handles it accordingly. Fetches patch notes if 'inactive', shows errors if 'failed'.
 * Calls updateUpgradeStatus() for active upgrades, logs an error message for unhandled states. Handles fetch errors.
 */
function checkUpgrading() {
    fetch('/upgrade/status')
        .then(response => response.json())
        .then(data => {
            updateUpgradeStatus();
            if (data.state === 'active') {
                return;
            }

            clearInterval(checkUpgradeIntervalId);
            lastUpdateLogs = [];

            if (data.state === 'inactive') {
                fetchPatchnotes(true);
            } else if (data.state === 'failed') {
                // Clear patchnotes section
                while (patchnotesContainer.firstChild) {
                    patchnotesContainer.removeChild(patchnotesContainer.firstChild);
                }

                // Show the error message and log
                const p = document.createElement('p');
                p.textContent = "An error occurred during the update process. Please submit the following error log to support@insightreactions.com for further assistance:";

                const textarea = document.createElement('textarea');
                textarea.title = "Error Log";
                textarea.textContent = data.errorMessage;
                textarea.style.width = '100%';
                textarea.style.height = '400px';
                textarea.style.marginBottom = '12px';
                textarea.readOnly = true;

                patchnotesContainer.appendChild(p);
                patchnotesContainer.appendChild(textarea);

                upgradeWaitingContainer.style.display = 'none';
                upgradeResultsContainer.style.display = 'flex';
                updateModal.style.display = 'flex';
            } else {
                console.error('Unhandled upgrade state:', data.state);
            }
        })
        .catch(error => console.error('Error:', error));
}

/**
 * Fetches and updates VRAM usage data, updating progress bar and title.
 * Handles fetch errors by logging them to console.
 */
function updateVram() {
    fetch('/gpu/usage/memory/0')
        .then(response => response.json())
        .then(data => {
            const total = data.total;
            const used = data.used + data.reserved;

            // Calculate the percentage of VRAM used
            const percentUsed = (used / total) * 100;
            vramProgressBar.value = percentUsed;

            // Update the title to show current / total in GB
            vramProgressBar.title = `${(used / 1024).toFixed(2)} GB / ${(total / 1024).toFixed(2)} GB`;
        })
        .catch(error => console.error('Error:', error));
}


// ON LOAD
updateVramIntervalId = setInterval(updateVram, 1000);
fetchPatchnotes(false);

fetch('/has-updates')
    .then(response => response.json())
    .then(data => {
        const hasUpdates = data.hasUpdates;
        updateButton.style.display = hasUpdates ? 'block' : 'none';
    })
    .catch((error) => console.error(error));

updateButton.addEventListener('click', (e) => {
    e.preventDefault();

    fetch('/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
    })
        .then((response) => response.json())
        .then(data => {
            refreshOnClose = true;
            checkUpgradeIntervalId = setInterval(checkUpgrading, 1000);

            upgradeWaitingContainer.style.display = 'flex';
            upgradeResultsContainer.style.display = 'none';

            updateModal.style.display = 'flex';
            updateButton.style.display = 'none';
        })
        .catch((error) => console.error(error));
});
document.getElementById('close-button').addEventListener('click', (e) => {
    e.preventDefault();

    localStorage.setItem("lastPatchDate", newPatchDate.toISOString());

    upgradeWaitingContainer.style.display = 'none';
    upgradeResultsContainer.style.display = 'none';
    updateModal.style.display = 'none';
    if (refreshOnClose) {
        window.location.reload();
    }
});
reclaimVramButton.addEventListener('click', (e) => {
    e.preventDefault();

    reclaimVramButton.classList.add('mat-button-disabled');
    reclaimVramButton.disabled = true;

    fetch('/gpu/flush', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
    })
        .catch((error) => console.error(error))
        .finally(() => {
            reclaimVramButton.classList.remove('mat-button-disabled');
            reclaimVramButton.disabled = false;
        });
});
