///////////////////////////////////////////////////////////////////////////////
// NAME:            popup.js
//
// AUTHOR:          Ethan D. Twardy <edtwardy@mtu.edu>
//
// DESCRIPTION:     
//
// CREATED:         05/20/2019
//
// LAST EDITED:     05/21/2019
////

function startTime() {
    chrome.runtime.getBackgroundPage((backPage) => {
        var pageClock = backPage.thePageClock;
        var time = pageClock.getTime();
        printTime(time);
        // Update the time every second, so it looks like we're continuously
        // counting
        if (pageClock.timerIsRunning()) {
            setInterval(() => {
                time = new Date(time.getTime() + 1000)
                printTime(time);
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

///////////////////////////////////////////////////////////////////////////////
// Main
///

startTime();
startTextarea();
let updateButton = document.getElementById('update');
updateButton.addEventListener('click', function(element) {
    chrome.runtime.getBackgroundPage((backPage) => {
        chrome.tabs.query({'active': true}, (tabs) =>{
            var pageClock = backPage.thePageClock;
            var textInput = document.getElementById('textarea').value;
            pageClock.setMatches(textInput.split('\n'));
            pageClock.update(tabs[0].url);
            // TODO: Timer does not stop running on updateButton listener
            // If the timer is currently running, and if after the updateButton
            // event is triggered the current page is not on the matches list,
            // the timer should stop running. This is not the case.
            startTime();
        });
    });
});

let resetButton = document.getElementById('reset');
resetButton.addEventListener('click', function(element) {
    chrome.runtime.getBackgroundPage((backPage) => {
        var pageClock = backPage.thePageClock;
        pageClock.resetTimer();
        printTime(pageClock.getTime());
    });
});

///////////////////////////////////////////////////////////////////////////////
