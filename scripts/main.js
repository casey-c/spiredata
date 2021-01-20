const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function formatTime(timestamp) {
    var date = new Date(timestamp * 1000);

    var month = monthNames[date.getMonth()];
    var day = date.getDay() + 1;
    var year = date.getFullYear();

    return month + " " + day + ", " + year;
}

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

function updateTimestamps(earliest, latest, numRuns) {
    var text = "This run data was collected over " + numRuns + " runs between " + formatTime(earliest) + " to " + formatTime(latest) + ".";
    document.getElementById("run_timestamps").innerText = text;
    document.getElementById("run_timestamps").style.display = "";
}

/* -------------------------------- */

var sortedRuns;

function loadGist(json) {
    console.log("Loaded JSON data:");
    console.log(json);

    var runs = json.runs;
    //runs.sort((a, b) => a.timestamp < b.timestamp);
    runs.sort((a, b) => {
        if (a.timestamp < b.timestamp) return 1
        else if (a.timestamp == b.timestamp) return 0
        else return -1
    });

    sortedRuns = runs;

    var updatedTime = getExactFormatTime(sortedRuns[0].timestamp);
    document.getElementById("last_updated").innerText = "Last updated: " + updatedTime;

    refresh();
}

function refresh() {
    var numberInput = document.getElementById("input_number");
    numberInput.max = sortedRuns.length;

    var numToCount = numberInput.value;
    console.log("Num to count: " + numToCount);
    console.log("Max to count: " + numberInput.max);

    if (!document.getElementById("input_checkbox").checked) {
        numToCount = sortedRuns.length;
    }

    // Compute the stats
    var wins = [0, 0, 0, 0];
    var losses = [0, 0, 0, 0];
    var totals = [0, 0, 0, 0];

    var earliestTimestamp = 99999999999999999;
    var latestTimestamp = 0;

    sortedRuns.slice(0, numToCount).forEach(run => {
        if (run.timestamp < earliestTimestamp) {
            earliestTimestamp = run.timestamp;
        }

        if (run.timestamp > latestTimestamp) {
            latestTimestamp = run.timestamp;
        }

        var index = 0;
        switch (run.class) {
            case "Silent":
                index = 1;
                break;
            case "Defect":
                index = 2;
                break;
            case "Watcher":
                index = 3;
                break;
        }

        totals[index]++;

        if (run.victory) {
            wins[index]++;
        } else {
            losses[index]++;
        }
    });

    // Update the HTML table
    document.getElementById("table_ironclad_wins").innerText = wins[0];
    document.getElementById("table_ironclad_losses").innerText = losses[0];
    document.getElementById("table_ironclad_winrate").innerText = (100.0 * (wins[0] / totals[0])).toFixed(2) + "%";
    document.getElementById("table_ironclad_total").innerText = totals[0];

    document.getElementById("table_silent_wins").innerText = wins[1];
    document.getElementById("table_silent_losses").innerText = losses[1];
    document.getElementById("table_silent_winrate").innerText = (100.0 * (wins[1] / totals[1])).toFixed(2) + "%";
    document.getElementById("table_silent_total").innerText = totals[1];

    document.getElementById("table_defect_wins").innerText = wins[2];
    document.getElementById("table_defect_losses").innerText = losses[2];
    document.getElementById("table_defect_winrate").innerText = (100.0 * (wins[2] / totals[2])).toFixed(2) + "%";
    document.getElementById("table_defect_total").innerText = totals[2];

    document.getElementById("table_watcher_wins").innerText = wins[3];
    document.getElementById("table_watcher_losses").innerText = losses[3];
    document.getElementById("table_watcher_winrate").innerText = (100.0 * (wins[3] / totals[3])).toFixed(2) + "%";
    document.getElementById("table_watcher_total").innerText = totals[3];

    var totalWins = wins[0] + wins[1] + wins[2] + wins[3];
    var totalLosses = losses[0] + losses[1] + losses[2] + losses[3];
    var totalOverall = totalWins + totalLosses;

    document.getElementById("table_overall_wins").innerText = totalWins;
    document.getElementById("table_overall_losses").innerText = totalLosses;
    document.getElementById("table_overall_winrate").innerText = (100.0 * (totalWins / totalOverall)).toFixed(2) + "%";
    document.getElementById("table_overall_total").innerText = totalOverall;

    updateTimestamps(earliestTimestamp, latestTimestamp, totalOverall);

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

        // Show the text elements we want
        var titleText = document.getElementById("title");
        titleText.innerText = json.name + "'s Slay the Spire Stats";

        document.getElementById("table").style.display = "";
        document.getElementById("last_updated").style.display = "";
        document.getElementById("incorrect_setup_text").style.display = "none";
        document.getElementById("correct_setup_text").style.display = "";

        document.getElementById("input_checkbox").style.display = "";
        document.getElementById("input_number").style.display = "";
    }
}

document.getElementById("input_number").onchange = refresh;
document.getElementById("input_checkbox").onclick = refresh;

fetch('setup.json')
    .then(res => res.json())
    .then(out => ensureSetup(out))
    .catch(err => {
        throw err;
    });