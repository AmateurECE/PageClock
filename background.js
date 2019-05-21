///////////////////////////////////////////////////////////////////////////////
// NAME:            background.js
//
// AUTHOR:          Ethan D. Twardy <edtwardy@mtu.edu>
//
// DESCRIPTION:     
//
// CREATED:         05/20/2019
//
// LAST EDITED:     05/20/2019
////

///////////////////////////////////////////////////////////////////////////////
// Class: PageClock
///

function PageClock(matches) {

    // Instance attributes
    this.matches = matches;
    this.url = null;
    this.startTime = new Date(0);
    this.debug = false;
    this.running = false;

    // Getters and Setters
    this.setUrl = function(url) { this.url = url; }
    this.getUrl = function()    { return this.url; }

    this.setDebug = function(debug) { this.debug = debug; }
    this.getDebug = function()      { return this.debug; }

    this.timerIsRunning = function()    { return this.running; }
    // TODO: Update getTime
    this.getTime = function()           { return this.time; }
    this.reset = function()             { this.time = new Date(0); }

    // Read/Initialize the current time variable from app storage
    this.readTime = function() {
        chrome.storage.sync.get(['PageClock.time'], (time) => {
            var self = this;
            if (typeof chrome.runtime.lastError !== 'undefined') {
                console.error(chrome.runtime.lastError);
                self.time = {};
            } else {
                self.time = new Date(time);
            }
        })
    }
    // TODO: this.readTime()
    // this.readTime(); // Initialize the time attribute at construction time.
    this.time = new Date(0);

    // Write/Save the current time variable into app storage
    this.writeTime = function() {
        chrome.storage.sync.set({'PageClock.time': this.time}, () => {
            if (typeof chrome.runtime.lastError !== 'undefined') {
                console.error(chrome.runtime.lastError);
            }
        });
    }

    // Start the timer (save the current date as the start time)
    this.startTimer = function() {
        this.startTime = new Date();
        if (this.debug) {
            console.log('Starting timer');
        }
        this.running = true;
    }

    // Stop the timer (increment this.time by the time that's elapsed)
    this.stopTimer = function() {
        // Stop the timer and update the time
        var diffTime = new Date(new Date() - this.startTime);
        this.time.setTime(this.time.getTime() + diffTime.getTime());
        if (this.debug) {
            console.log('Stopping timer: ' + this.time.getSeconds()
                        + ' seconds');
        }
        this.running = false;
    }

    // Update the timer
    this.update = function(url) {
        var self = this;
        if (url == self.url) {
            return;
        }

        self.url = url;
        if (self.debug) {
            console.log('New URL: ' + url);
        }

        // Stop timer, if it is running
        if (self.timerIsRunning()) {
            self.stopTimer();
        }

        // Determine if we also need to start the timer
        self.matches.forEach(function(element) {
            if (self.url.indexOf(element) !== -1) {
                // Start the timer
                if (self.debug) {
                    console.log('Matches: ' + element);
                }
                self.startTimer();
            }
        })
    }
}

///////////////////////////////////////////////////////////////////////////////
// Main
///

// Called whenever:
// - The Tab object experiences an update to its attributes
// - A different Tab becomes active.
function updatedListener(tabId, changeInfo, tab) {
    chrome.tabs.query({"active": true},
                      function(tabs) {
                          // TODO: Check that tabs has exactly one entry.
                          thePageClock.update(tabs[0].url);
                      });
}

// Called when the background script is installed. Initializes thePageClock.
var thePageClock = null;
chrome.runtime.onInstalled.addListener(function() {
    thePageClock = new PageClock(['developer.chrome.com']);
    // TODO: Unset debug
    thePageClock.setDebug(true);

    // Welcome message
    console.log('Installed PageClock v'
                + chrome.runtime.getManifest().version);
});

// Set up event listeners.
// TODO: Run when browser is closed?
// TODO: Run if this window is no longer focused?
chrome.tabs.onUpdated.addListener(updatedListener);
chrome.tabs.onActivated.addListener(updatedListener);

///////////////////////////////////////////////////////////////////////////////
