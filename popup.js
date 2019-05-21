function startTime() {
    chrome.runtime.getBackgroundPage((backPage) => {
        var time = backPage.thePageClock.getTime();
        printTime(time);
        // Update the time every second, so it looks like we're continuously
        // counting
        setInterval(() => {
            time = new Date(time.getTime() + 1000)
            printTime(time);
        }, 1000);
    });
}

function printTime(time) {
    document.getElementById('time').innerHTML =
        zeroExtend(time.getHours()) + 'h '
        + zeroExtend(time.getMinutes()) + 'm '
        + zeroExtend(time.getSeconds()) + 's';
}

function zeroExtend(i) {
    if (i < 10) {i = '0' + i};
    return i;
}

startTime();
