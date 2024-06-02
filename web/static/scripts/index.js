// GLOBALS
const ipAddress = window.location.href.replace(/^.*?:\/\//, '').replace(/\/.*/, '').replace(/:.*/, '');
var checkPid = undefined;
var pidCheckIntervalId = undefined;
var newPatchDate = new Date(localStorage.getItem("lastPatchDate"));
var refreshOnClose = false;
const upgradeWaitingContainer = document.getElementById('upgrade-waiting-container');
const upgradeResultsContainer = document.getElementById('upgrade-results-container');
const patchnotesContainer = document.getElementById('patchnotes-container');
const updateModal = document.getElementById('update-modal');
const updateButton = document.getElementById('update-button');

// FUNCTIONS
function fetchPatchnotes(showSystemOnlyUpdates) {
    console.log("Fetching patch notes...");
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
                    console.log("Processing item:", item);
                    const header = document.createElement('h2');
                    const filenameParts = item.filename.split('-'); // Split the string at '-'
                    const nameVersionParts = filenameParts[1].split('.') // Split the second part of the split string at '.'
                    const headerText = `${filenameParts[0].replace('_', ' ')} v${nameVersionParts[0]}.${nameVersionParts[1]}`; // Replace '_' with ' ', and construct the final string
                    header.textContent = headerText;
                    header.style.alignSelf = "start";

                    const textarea = document.createElement('textarea');
                    textarea.title = "Patch Notes";
                    textarea.textContent = item.content;
                    textarea.style.width = '600px';
                    textarea.style.height = '400px'; // Adjust the height as needed for your design
                    textarea.style.marginBottom = '12px'; // Add some space below each textarea
                    textarea.readOnly = true;

                    patchnotesContainer.appendChild(header);
                    patchnotesContainer.appendChild(textarea);
                });

                newPatchDate = new Date(patchnotes[0].creationTime);
            } else {
                const p = document.createElement('p');
                p.textContent = "No additional patch notes are available."
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

function checkPidExists() {
    if (typeof checkPid !== 'number') {
        clearInterval(pidCheckIntervalId);
        return;
    }

    fetch(`/pid-exists/${checkPid}`)
        .then(response => response.json())
        .then(data => {
            if (!data.exists) {
                clearInterval(pidCheckIntervalId);
                fetchPatchnotes(true);
            }
        })
        .catch(error => console.error('Error:', error));
}

// ON LOAD
fetchPatchnotes(false);

fetch('/has-updates')
    .then(response => response.json())
    .then(data => {
        const hasUpdates = data.hasUpdates;
        updateButton.style.display = hasUpdates ? 'block' : 'none';
    })
    .catch((error) => console.error(error));

document.querySelector('.openwebui').href = 'http://' + ipAddress + ':8080';
document.querySelector('.stableswarmui').href = 'http://' + ipAddress + ':7801';

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
            checkPid = data.pid;
            pidCheckIntervalId = setInterval(checkPidExists, 1000);

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