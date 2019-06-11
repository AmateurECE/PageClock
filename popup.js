///////////////////////////////////////////////////////////////////////////////
// NAME:            popup.js
//
// AUTHOR:          Ethan D. Twardy <edtwardy@mtu.edu>
//
// DESCRIPTION:     
//
// CREATED:         05/20/2019
//
// LAST EDITED:     06/11/2019
////

// TODO: Show badge when timer is running.
//   The badge will look something like this, in a nice light blue:
//     *     *
//     * * * *
//     *  *  *
//     *     *
//      *   *
//        *

function updateTime() {
    chrome.runtime.getBackgroundPage((backPage) => {
        var pageClock = backPage.thePageClock;
        printTime(pageClock.getTimer().getTime());
        // It's possible that the interval is running from a previous
        // invocation, so first attempt to stop it.
        if (intervalId !== null) {
            clearInterval(intervalId);
            intervalId = null;
        }
        // Update the time every second, so it looks like we're continuously
        // counting
        if (pageClock.getTimer().isRunning()) {
            intervalId = setInterval(() => {
                printTime(pageClock.getTimer().getTime());
            }, 1000);
        }
    });
}

function printTime(time) {
    // The Unix Epoch starts at 1900 hours, hence we subtract 19 hours.
    document.getElementById('time').innerHTML =
        zeroExtend(time.getHours() - 19) + 'h '
        + zeroExtend(time.getMinutes()) + 'm '
        + zeroExtend(time.getSeconds()) + 's';
}

function zeroExtend(i) {
    if (i < 10) {i = '0' + i};
    return i;
}

function startTextarea() {
    chrome.runtime.getBackgroundPage((backPage) => {
        var pageClock = backPage.thePageClock;
        document.getElementById('textarea').innerHTML =
            pageClock.getMatches().join('\n');
    });
}

function printLastReset() {
    chrome.runtime.getBackgroundPage((backPage) => {
        var pageClock = backPage.thePageClock;
        document.getElementById('lastReset').innerHTML =
            pageClock.getTimer().getLastReset();
    });
}

///////////////////////////////////////////////////////////////////////////////
// Main
///

// Initialize the page
let intervalId = null;
updateTime();
printLastReset();
startTextarea();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.msg === 'Timer.stateChange') {
        updateTime();
    }
});

// Set up event handlers
let updateButton = document.getElementById('update');
updateButton.addEventListener('click', function(element) {
    chrome.runtime.getBackgroundPage((backPage) => {
        var pageClock = backPage.thePageClock;
        var textInput = document.getElementById('textarea').value;

        // If textInput is empty, .split('\n') creates the array [""], when
        // really we want [].
        if (textInput == '') {
            pageClock.setMatches([]);
        } else {
            pageClock.setMatches(textInput.split('\n'));
        }
    });
});

let resetButton = document.getElementById('reset');
resetButton.addEventListener('click', function(element) {
    chrome.runtime.getBackgroundPage((backPage) => {
        var pageClock = backPage.thePageClock;
        pageClock.getTimer().reset();
        updateTime();
        printLastReset();
    });
});

///////////////////////////////////////////////////////////////////////////////
