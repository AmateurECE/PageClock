///////////////////////////////////////////////////////////////////////////////
// NAME:            Timer.js
//
// AUTHOR:          Ethan D. Twardy <edtwardy@mtu.edu>
//
// DESCRIPTION:     Contains a class that implements the timer logic.
//
// CREATED:         05/21/2019
//
// LAST EDITED:     05/22/2019
////

///////////////////////////////////////////////////////////////////////////////
// Class: TimerSerializer
////

function TimerSerializer() {
    this.timeName = 'PageClock.time';

    // Read/Initialize the current time variable from app storage
    this.readTime = function(timer) {
        var dict = {};
        dict[this.timeName] = null;
        chrome.storage.sync.get(dict, (time) => {
            var self = this;
            if (typeof chrome.runtime.lastError !== 'undefined') {
                console.error(chrome.runtime.lastError);
            }

            // Check if the object is empty. If it is, create a new date.
            if (Object.entries(time[self.timeName]).length === 0
                && time[self.timeName].constructor === Object) {
                console.warn('Could not read time from storage. '
                             + 'Resetting timer.');
                timer.time = new Date(0);
            } else {
                timer.time = new Date(JSON.parse(time[self.timeName]));
            }
        })
    }

    // Write/Save the current time variable into app storage
    this.writeTime = function(timer) {
        var dict = {};
        dict[this.timeName] = JSON.stringify(timer.time);
        chrome.storage.sync.set(dict, () => {
            if (typeof chrome.runtime.lastError !== 'undefined') {
                console.error(chrome.runtime.lastError);
                console.warn('Could not write time to storage.');
            }
        });
    }
}

///////////////////////////////////////////////////////////////////////////////
// Class: Timer
///

function Timer(timerSerializer) {
    // Instance attributes
    this.running = false;
    this.startTime = null;
    this.debug = new Debugger(true);

    this.timerSerializer = timerSerializer;
    this.time = this.timerSerializer.readTime(this);

    this.getDebug = function() { return this.debug; }
    this.setDebug = function(debug) { this.debug = debug; }
    this.isRunning = function()    { return this.running; }
    this.getTime = function()           { return this.time; }
    this.reset = function()             { this.time.setTime(0); }

    // Start the timer (save the current date as the start time)
    this.start = function() {
        var debug = this.debug.debug;
        this.startTime = new Date();
        debug('Starting timer');
        this.running = true;
    }

    // Stop the timer (increment this.time by the time that's elapsed)
    this.stop = function() {
        var debug = this.debug.debug;
        // Stop the timer and update the time
        var diffTime = new Date(new Date() - this.startTime);
        this.time.setTime(this.time.getTime() + diffTime.getTime());
        debug('Stopping timer: ' + this.time.getSeconds() + ' seconds');
        // Save the time to storage.
        this.timerSerializer.writeTime(this);
        this.running = false;
    }
}

///////////////////////////////////////////////////////////////////////////////
