// TODO: load from gist
//var fullList = ["One", "Two", "Three"];
var fullList = [];
var filteredList = [];

function isOk(run, filter) {
    // Victory
    var victoryText = run.victory ? "victory" : "defeat";
    if (victoryText.includes(filter.toLowerCase()))
        return true;

    // Class name
    if (run.class.toLowerCase().includes(filter.toLowerCase()))
        return true;

    // Relics
    for (var i = 0; i < run.relics.length; ++i) {
        if (run.relics[i].toLowerCase().includes(filter.toLowerCase()))
            return true;
    }

    // Cards
    for (var i = 0; i < run.deck.length; ++i) {
        if (run.deck[i].toLowerCase().includes(filter.toLowerCase()))
            return true;
    }



    return false;
}

function updateFilters() {
    var currentText = document.getElementById("search").value;
    var words = currentText.split(" ");

    filteredList = fullList;

    for (var i = 0; i < words.length; ++i) {
        var filter = words[i];

        filteredList = filteredList.filter(run => isOk(run, filter));
    }

    updateUI(filteredList);
}

/* -------------------------------- */

function pad(num, size) {
    return ('000000000' + num).substr(-size);
}

function getExactFormatTime(timestamp) {
    var date = new Date(timestamp * 1000);

    var month = date.getMonth() + 1;
    var day = date.getDay() + 1;
    var year = date.getFullYear();

    var hour = date.getHours();
    var min = date.getMinutes();

    return pad(month, 2) + "/" + pad(day, 2) + "/" + year + " " + hour + ":" + pad(min, 2);
}

/* -------------------------------- */

function cleanedRunText(run) {
    var res = run.class;
    res += (run.victory) ? " [Victory] " : " [Slain on floor " + run.floor_reached + "] ";

    // TODO

    return res;
}

function formattedStringList(list) {
    var res = "";

    for (var i = 0; i < list.length; ++i)
        res += list[i] + ", ";

    if (list.length > 0)
        res = res.substr(0, res.length - 2);

    return res;
}

function getTooltipText(run) {
    // Relics
    var res = "Relics: ";
    res += formattedStringList(run.relics);

    // Cards
    res += "\n\nCards: ";
    res += formattedStringList(run.deck);

    return res;
}

function buildRunListElement(run) {
    var li = document.createElement('li');

    var link = document.createElement('a');
    link.href = "javascript:void(0)";
    link.title = getTooltipText(run);
    link.className = (run.victory) ? "victory" : "defeat";

    var mainText = document.createTextNode(cleanedRunText(run));

    var emphasisText = document.createElement('em');
    emphasisText.innerText = "\n " + getExactFormatTime(run.timestamp);

    link.appendChild(mainText);
    link.appendChild(emphasisText);

    li.appendChild(link);

    return li;
}

function updateUI() {
    var list = document.getElementById("list");
    list.innerHTML = "";

    for (var i = 0; i < filteredList.length; ++i) {
        list.appendChild(buildRunListElement(filteredList[i]));
    }

    document.getElementById("count").innerText = "Displaying " + filteredList.length + " runs out of " + fullList.length + " in the entire dataset.";
}

/* -------------------------------- */

function loadGist(json) {
    console.log("Loaded JSON data:");
    console.log(json);

    var runs = json.runs;
    runs.sort((a, b) => {
        if (a.timestamp < b.timestamp) return 1
        else if (a.timestamp == b.timestamp) return 0
        else return -1
    });

    fullList = runs;
    filteredList = runs;

    updateUI();

    // var updatedTime = getExactFormatTime(sortedRuns[0].timestamp);
    // document.getElementById("last_updated").innerText = "Last updated: " + updatedTime;

    //refresh();
}

function ensureSetup(json) {
    if (json.gist == "PLACE YOUR GIST URL HERE") {
        console.log("Not yet setup!");
    } else {
        console.log("The gist is ", json.gist);

        fetch(json.gist)
            .then(res => res.json())
            .then(out => loadGist(out))
            .catch(err => {
                throw err;
            });
    }
}

document.getElementById("search").onchange = updateFilters;

fetch('setup.json')
    .then(res => res.json())
    .then(out => ensureSetup(out))
    .catch(err => {
        throw err;
    });