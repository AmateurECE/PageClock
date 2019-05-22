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

// Return true if obj is an empty object.
function isEmpty(obj) {
    return Object.entries(obj).length === 0
        && obj.constructor === Object;
}

///////////////////////////////////////////////////////////////////////////////
// Class: TimerSerializer
////

function TimerSerializer() {
    this.timeName = 'PageClock.time';
    this.lastResetName = 'PageClock.lastReset';

    // Read/Initialize the current time variable from app storage
    this.readTime = function(timer) {
        var dict = {};
        dict[this.timeName] = null;
        dict[this.lastResetName] = null;
        chrome.storage.sync.get(dict, (time) => {
            var self = this;
            if (typeof chrome.runtime.lastError !== 'undefined') {
                console.error(chrome.runtime.lastError);
            }

            // Load the time
            // Check if the object is empty. If it is, create a new date.
            if (time[self.timeName] === null
                || time[self.lastResetName] === null
                || isEmpty(time[self.timeName])
                || isEmpty(time[self.lastResetName])) {
                console.warn('Could not read time from storage. '
                             + 'Resetting timer and last reset date.');
                timer.time = new Date(0);
                timer.lastReset = new Date();
            } else {
                timer.time = new Date(JSON.parse(time[self.timeName]));
                timer.lastReset =
                    new Date(JSON.parse(time[self.lastResetName]));
            }
        })
    }

    // Write/Save the current time variable into app storage
    this.writeTime = function(timer) {
        var dict = {};
        dict[this.timeName] = JSON.stringify(timer.time);
        dict[this.lastResetName] = JSON.stringify(timer.lastReset);
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
    this.timerSerializer.readTime(this);

    this.getLastReset = function() { return this.lastReset; }
    this.getDebug = function() { return this.debug; }
    this.setDebug = function(debug) { this.debug = debug; }
    this.isRunning = function()    { return this.running; }
    this.getTime = function() {
        if (this.isRunning()) {
            return new Date(this.time.getTime() + this.diffTime().getTime());
        }
        return this.time;
    }

    // Get the time that has elapsed since starting the timer.
    this.diffTime = function() {
        return new Date(new Date() - this.startTime);
    }

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
        this.time.setTime(this.time.getTime() + this.diffTime().getTime());
        debug('Stopping timer: ' + this.time.getSeconds() + ' seconds');
        // Save the time to storage.
        this.timerSerializer.writeTime(this);
        this.running = false;
    }

    this.reset = function() {
        this.time = new Date(0);
        this.lastReset = new Date();
    }

}

///////////////////////////////////////////////////////////////////////////////
