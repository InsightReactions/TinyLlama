
function createCard(id, name, description, iconHref, url) {
    var cardFrame = document.createElement("div");
    cardFrame.className = "card-frame fitArticleWidth";

    var cardIcon = document.createElement("img");
    cardIcon.style = "height: 64px; padding 12px; align-self: center;";
    cardIcon.alt = name + " icon";
    cardIcon.src = iconHref;
    cardFrame.appendChild(cardIcon);

    var cardContent = document.createElement("div");
    cardContent.className = "mat-card";
    cardFrame.appendChild(cardContent);

    var cardTitle = document.createElement("a");
    cardTitle.className = id + " mat-card-title";
    cardTitle.href = url;
    cardContent.appendChild(cardTitle);

    var cardDescription = document.createElement("p");
    cardDescription.className = "mat-card-content";
    cardDescription.innerText = description;
    cardContent.appendChild(cardDescription);

    console.log("created card for plugin: " + name);
    return cardFrame;
}

function populatePlugins() {
    console.log("getting plugins...");
    fetch("/plugins")
        .then((response) => response.json())
        .then((data) => {
            var container = document.getElementById("plugin-browser-container");
            for (var i = 0; i < data.length; i++) {
                var plugin = data[i];
                var card = createCard(plugin.id, plugin.name, plugin.description, plugin.iconHref, plugin.url);
                container.appendChild(card);
            }
        });
}

// on load, create cards for each article and append to the `pb-body` container
populatePlugins();
