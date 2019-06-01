///////////////////////////////////////////////////////////////////////////////
// NAME:            popup.js
//
// AUTHOR:          Ethan D. Twardy <edtwardy@mtu.edu>
//
// DESCRIPTION:     
//
// CREATED:         05/20/2019
//
// LAST EDITED:     05/31/2019
////

// TODO: icons
// TODO: Change icon when timer is running.

function startTime() {
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
startTime();
printLastReset();
startTextarea();

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

        // TODO: Race condition in updateHandler
        // Sometimes, when a new entry is added to `matches' that fits one of
        // the Timer Activation Conditions, the on-page timer will check the
        // state of the timer before it has been updated, so the timer will
        // start, but the on-page timer will not.
        startTime();
    });
});

let resetButton = document.getElementById('reset');
resetButton.addEventListener('click', function(element) {
    chrome.runtime.getBackgroundPage((backPage) => {
        var pageClock = backPage.thePageClock;
        pageClock.getTimer().reset();
        startTime();
        printLastReset();
    });
});

///////////////////////////////////////////////////////////////////////////////
