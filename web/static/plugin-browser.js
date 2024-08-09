// Create the removal modal content
let removeModal = document.createElement('div');
removeModal.className = 'fitArticleWidth modal';
removeModal.id = 'confirm-removal-modal';
removeModal.style.cssText = "display: none; flex-direction: column; justify-content: space-between; align-items: center; z-index: 1; padding: 12px; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background-color: var(--ir-background-color); box-shadow: 0px 0px 25px rgba(0, 0, 0, 0.8); max-height: 80%; overflow-y: auto;";

let innerDiv1 = document.createElement('div');
removeModal.appendChild(innerDiv1);

let innerDiv2 = document.createElement('div');
innerDiv2.style.cssText = "display: flex; flex-direction: column; justify-content: space-between; align-items: center; width: 100%; height: 100%;";
removeModal.appendChild(innerDiv2);

let h2Element = document.createElement('h2');
h2Element.textContent = "Confirm Plugin Removal";
innerDiv2.appendChild(h2Element);

let buttonDiv = document.createElement('div');
buttonDiv.style.cssText = "display: flex; justify-content: space-around; align-items: center; width: 100%; margin-top: 16px;";
innerDiv2.appendChild(buttonDiv);

let cancelButton = document.createElement('button');
cancelButton.className = 'mat-raised-button mat-error';
cancelButton.id = 'remove-cancel-button';
cancelButton.textContent = "Cancel";
cancelButton.addEventListener('click', function() {
    removeModal.style.display = 'none';
});
buttonDiv.appendChild(cancelButton);

let removalFrameTarget = null;
function removePlugin() {
    if (removalFrameTarget === null) {
        return;
    }
    // else removePluginTarget is a valid plugin name
    toggleSpinner(removalFrameTarget, true);
    const pluginName = removalFrameTarget.getAttribute('plugin');
    
    fetch('/plugin-marketplace/uninstall/' + pluginName)
    .then(response => {
        updateControlState(removalFrameTarget);
    })
    .catch(error => {
        console.log('Error:', error);
    });
}

let confirmButton = document.createElement('button');
confirmButton.className = 'mat-raised-button primary-button';
confirmButton.id = 'remove-confirm-button';
confirmButton.textContent = "Confirm";
confirmButton.addEventListener('click', function() {
    removeModal.style.display = 'none';
    removePlugin();
});
buttonDiv.appendChild(confirmButton);

let innerDiv3 = document.createElement('div');
removeModal.appendChild(innerDiv3);

// more GLOBALS
const rootContainer = document.getElementById("plugin-browser");
rootContainer.appendChild(removeModal);

const rootSpinner = document.getElementsByClassName("lds-grid")[0];

// FUNCTIONS
function toggleSpinner(frame, show) {
    var cardControls = frame.querySelector('.card-controls');
    var spinner = frame.querySelector('.lds-grid');

    if (show) {
        cardControls.style.display = 'none';
        spinner.style.display = 'inline-block';
    } else {
        cardControls.style.display = 'flex';
        spinner.style.display = 'none';
    }
}

function updateControlState(frame) {
    const pluginName = frame.getAttribute('plugin');

    toggleSpinner(frame, true);
    fetch('/plugin-marketplace/status/' + pluginName)
    .then(response => response.json())
    .then(data => {
        var addButton = frame.querySelector('.add-button');
        var removeButton = frame.querySelector('.remove-button');
        var startButton = frame.querySelector('.start-button');
        var stopButton = frame.querySelector('.stop-button');

        if (data.installed) {
            addButton.style.display = 'none';
            if (data.active) {
                removeButton.style.display = 'none';
                startButton.style.display = 'none';
                stopButton.style.display = 'grid';
            } else {
                removeButton.style.display = 'grid';
                startButton.style.display = 'grid';
                stopButton.style.display = 'none';
            }
        } else {
            addButton.style.display = 'grid';
            removeButton.style.display = 'none';
            startButton.style.display = 'none';
            stopButton.style.display = 'none';
        }

        toggleSpinner(frame, false);
    });
}

function onAddPluginClicked() {
    var frame = this.closest('.plugin-data');
    const pluginName = frame.getAttribute('plugin');
    toggleSpinner(frame, true);
    
    // if it succeeds, 200 OK will be returned. If fails, 404 or 500 will be returned
    fetch('/plugin-marketplace/install/' + pluginName)
    .then(response => {
        // TODO: show error message if response is not 200 OK
        updateControlState(frame);
    });
}

function onRemovePluginClicked() {
    removalFrameTarget = this.closest('.plugin-data');
    removeModal.style.display = 'flex';
}

function onStartPluginClicked() {
    var frame = this.closest('.plugin-data');
    const pluginName = frame.getAttribute('plugin');
    toggleSpinner(frame, true);
    
    // if it succeeds, 200 OK will be returned. If fails, 404 or 500 will be returned
    fetch('/plugin-marketplace/start/' + pluginName)
    .then(response => {
        // TODO: show error message if response is not 200 OK
        updateControlState(frame);
    });
}

function onStopPluginClicked() {
    var frame = this.closest('.plugin-data');
    const pluginName = frame.getAttribute('plugin');
    toggleSpinner(frame, true);
    
    // if it succeeds, 200 OK will be returned. If fails, 404 or 500 will be returned
    fetch('/plugin-marketplace/stop/' + pluginName)
    .then(response => {
        // TODO: show error message if response is not 200 OK
        updateControlState(frame);
    });
}

function createCard(package, name, description, route, port) {
    const pluginName = package.replace(/^tlweb-/, '');

    var cardFrame = document.createElement("div");
    cardFrame.className = "card-frame plugin-data";
    cardFrame.style = "width: 45%; height: 180px;";
    cardFrame.setAttribute('plugin', pluginName);

    var cardLeft = document.createElement("div");
    cardLeft.style = "display: grid; width: 88px; align-content: space-between; justify-content: center; padding: 12px; gap: 6px;";
    cardFrame.appendChild(cardLeft);

    var cardIcon = document.createElement("img");
    cardIcon.style = "height: 64px; align-self: center; justify-self: center;";
    cardIcon.alt = name + " icon";
    cardIcon.src = "/plugin-marketplace/" + pluginName + ".png";
    cardLeft.appendChild(cardIcon);

    var cardSpinner = rootSpinner.cloneNode(true);
    cardLeft.appendChild(cardSpinner);

    var cardControls = document.createElement("div");
    cardControls.className = "card-controls";
    cardControls.style = "display: none; flex-direction: column; align-items: center; gap: 6px;"
    cardLeft.appendChild(cardControls);
    
    const buttonClassName = "mat-raised-button";
    const buttonStyle = "width: 64px; justify-self: center; justify-content: center; display: none; padding: 6px;"

    var cardAddButton = document.createElement("button");
    cardAddButton.className = buttonClassName + " add-button";
    cardAddButton.style = buttonStyle;
    cardAddButton.addEventListener('click', onAddPluginClicked);
    cardControls.appendChild(cardAddButton);

    var cardAddIcon = document.createElement('img');
    cardAddIcon.style = "width: 24px; height: 24px;";
    cardAddIcon.src = "/circle-plus.svg";
    cardAddButton.appendChild(cardAddIcon);

    var cardRemoveButton = document.createElement("button");
    cardRemoveButton.className = buttonClassName + " remove-button";
    cardRemoveButton.style = buttonStyle;
    cardRemoveButton.addEventListener('click', onRemovePluginClicked);
    cardControls.appendChild(cardRemoveButton);

    var cardRemoveIcon = document.createElement('img');
    cardRemoveIcon.style = "width: 24px; height: 24px;";
    cardRemoveIcon.src = "/circle-minus.svg";
    cardRemoveButton.appendChild(cardRemoveIcon);

    var cardStartButton = document.createElement("button");
    cardStartButton.className = buttonClassName + " start-button";
    cardStartButton.style = buttonStyle;
    cardStartButton.addEventListener('click', onStartPluginClicked);
    cardControls.appendChild(cardStartButton);

    var cardStartIcon = document.createElement('img');
    cardStartIcon.style = "width: 24px; height: 24px;";
    cardStartIcon.src = "/player-play.svg";
    cardStartButton.appendChild(cardStartIcon);

    var cardStopButton = document.createElement("button");
    cardStopButton.className = buttonClassName + " stop-button";
    cardStopButton.style = buttonStyle;
    cardStopButton.addEventListener('click', onStopPluginClicked);
    cardControls.appendChild(cardStopButton);

    var cardStopIcon = document.createElement('img');
    cardStopIcon.style = "width: 24px; height: 24px;";
    cardStopIcon.src = "/player-stop.svg";
    cardStopButton.appendChild(cardStopIcon);

    var cardRight = document.createElement("div");
    cardRight.className = "mat-card";
    cardFrame.appendChild(cardRight);

    var cardTitle = document.createElement("a");
    cardTitle.className = "mat-card-title";
    cardTitle.href = "http://" + route + ":" + port;
    cardTitle.text = name;
    cardRight.appendChild(cardTitle);

    var cardDescription = document.createElement("p");
    cardDescription.className = "mat-card-content";
    cardDescription.style = "overflow: hidden; text-overflow: ellipsis;";
    cardDescription.innerText = description;
    cardRight.appendChild(cardDescription);

    updateControlState(cardFrame);
    return cardFrame;
}

function populatePlugins() {
    fetch('/default-route')
    .then(response => response.json())
    .then(data => {
        var route = data.defaultRoute;
        fetch("/plugin-marketplace/list")
        .then((response) => response.json())
        .then(async (data) => {
            const fetchPromises = [];
            for (var i = 0; i < data.plugins.length; i++) {
                var pluginName = data.plugins[i];
                fetchPromises.push(fetch("/plugin-marketplace/" + pluginName + ".json"));
            }

            // Report 404s and continue with the rest of the plugins
            return Promise.allSettled(fetchPromises).then((results) => {
                // First report any 404 errors to the console
                const errorResults = results.filter((result) => result.status === "rejected");
                for (var i = 0; i < errorResults.length; i++) {
                    var errorResult = errorResults[i];
                    console.error("Error fetching plugin data: ", errorResult.reason);
                }

                // Then continue with the successful results
                const successfulResults = results.filter((result) => result.status === "fulfilled");
                return Promise.all(successfulResults.map((result) => result.value.json()));
            });
        })
        .then((plugins) => {
            plugins.sort((a, b) => a.name.localeCompare(b.name));
            for (var i = 0; i < plugins.length; i++) {
                var plugin = plugins[i];
                var card = createCard(plugin.package, plugin.name, plugin.description, route, plugin.port);
                rootContainer.appendChild(card);
            }
        })
        .catch(error => console.error('Error:', error));
    })
    .catch(error => console.error('Error:', error));
}

// on load, create cards for each article and append to the `pb-body` container
populatePlugins();
