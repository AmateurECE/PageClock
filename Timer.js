///////////////////////////////////////////////////////////////////////////////
// NAME:            Timer.js
//
// AUTHOR:          Ethan D. Twardy <edtwardy@mtu.edu>
//
// DESCRIPTION:     Contains a class that implements the timer logic.
//
// CREATED:         05/21/2019
//
// LAST EDITED:     06/11/2019
////

// Return true if obj is an empty object.
function isEmpty(obj) {
    return obj === null || typeof obj === 'undefined'
        || (Object.entries(obj).length === 0
            && obj.constructor === Object);
}

///////////////////////////////////////////////////////////////////////////////
// Class: TimerEvent
////


class TimerEvent {
    static dispatchInactive() {
        chrome.runtime.sendMessage({
            'msg': 'Timer.stateChange',
            'data': {
                'running': false
            }
        });
        document.dispatchEvent(new CustomEvent('Timer.stateChange', {
            'detail': false
        }));
    }

    static dispatchActive() {
        chrome.runtime.sendMessage({
            'msg': 'Timer.stateChange',
            'data': {
                'running': true
            }
        });
        document.dispatchEvent(new CustomEvent('Timer.stateChange', {
            'detail': true
        }));
    }
}

///////////////////////////////////////////////////////////////////////////////
// Class: TimerSerializer
////

function TimerSerializer() {
    this.timeName = 'time';
    this.lastResetName = 'lastReset';

    // Read/Initialize the current time variable from app storage
    this.readTime = function(timer) {
        var keys = [this.timeName, this.lastResetName];
        chrome.storage.local.get(keys, (time) => {
            var self = this;

            timer.debug.debug('Reading time from storage...');
            if (typeof chrome.runtime.lastError !== 'undefined') {
                console.error(chrome.runtime.lastError);
            }

            // Load the time
            // Check if the object is empty. If it is, create a new date.
            if (isEmpty(time[self.timeName])
                || isEmpty(time[self.lastResetName])) {
                console.warn('Could not read time from storage. '
                             + 'Resetting timer and last reset date.');
                timer.reset();
            } else {
                timer.time = new Date(JSON.parse(time[self.timeName]));
                timer.lastReset =
                    new Date(JSON.parse(time[self.lastResetName]));
            }
        });
    }

    // Write/Save the current time variable into app storage
    this.writeTime = function(timer) {
        var dict = {};
        dict[this.timeName] = JSON.stringify(timer.time);
        dict[this.lastResetName] = JSON.stringify(timer.lastReset);
        chrome.storage.local.set(dict, () => {
            timer.debug.debug('Writing time to storage...');
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
    this.debug = new Debugger(false);

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
        TimerEvent.dispatchActive();
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
        TimerEvent.dispatchInactive();
    }

    this.reset = function() {
        this.time = new Date(0);
        this.lastReset = new Date();
        this.startTime = this.lastReset;
        this.debug.debug('Resetting timer: time = ' + this.time);
        // Save the time to storage
        this.timerSerializer.writeTime(this);
    }

}

///////////////////////////////////////////////////////////////////////////////
