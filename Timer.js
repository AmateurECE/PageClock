///////////////////////////////////////////////////////////////////////////////
// NAME:            Timer.js
//
// AUTHOR:          Ethan D. Twardy <edtwardy@mtu.edu>
//
// DESCRIPTION:     Contains a class that implements the timer logic.
//
// CREATED:         05/21/2019
//
// LAST EDITED:     05/21/2019
////

///////////////////////////////////////////////////////////////////////////////
// Class: Timer
///

function Timer() {
    // Instance attributes
    this.running = false;
    this.startTime = new Date(0);
    this.time = new Date(0);
    this.debug = new Debugger();

    this.getDebug = function() { return this.debug; }
    this.setDebug = function(debug) { this.debug = debug; }
    this.isRunning = function()    { return this.running; }
    this.getTime = function()           { return this.time; }
    this.reset = function()             { this.time.setTime(0); }

    // Read/Initialize the current time variable from app storage
    this.readTime = function(name) {
        chrome.storage.sync.get([name], (time) => {
            var self = this;
            if (typeof chrome.runtime.lastError !== 'undefined') {
                console.error(chrome.runtime.lastError);
                self.time = {};
            } else {
                self.time = new Date(time);
            }
        })
    }

    // Write/Save the current time variable into app storage
    this.writeTime = function(name) {
        chrome.storage.sync.set({name: this.time}, () => {
            if (typeof chrome.runtime.lastError !== 'undefined') {
                console.error(chrome.runtime.lastError);
            }
        });
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
        var diffTime = new Date(new Date() - this.startTime);
        this.time.setTime(this.time.getTime() + diffTime.getTime());
        debug('Stopping timer: ' + this.time.getSeconds() + ' seconds');
        this.running = false;
    }
}

///////////////////////////////////////////////////////////////////////////////
