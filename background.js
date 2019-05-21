///////////////////////////////////////////////////////////////////////////////
// NAME:            background.js
//
// AUTHOR:          Ethan D. Twardy <edtwardy@mtu.edu>
//
// DESCRIPTION:     
//
// CREATED:         05/20/2019
//
// LAST EDITED:     05/21/2019
////

///////////////////////////////////////////////////////////////////////////////
// Class: Debugger
////

function Debugger(debugState) {
    this.debugState = false || debugState;
    this.debug = function(string) {
        if (debugState) {
            console.log(string);
        }
    }
}

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
    // TODO: Update getTime
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
// Class: PageClock
///

function PageClock(matches) {
    // Instance attributes
    this.matches = matches;
    this.url = null;
    this.debug = new Debugger();
    this.timer = new Timer();

    // TODO: this.readTime()
    // this.readTime(); // Initialize the time attribute at construction time.

    // Getters and Setters
    this.getUrl = function()    { return this.url; }
    this.setUrl = function(url) { this.url = url; }

    this.getDebug = function()      { return this.debug; }
    this.setDebug = function(debug) {
        this.debug = debug;
        this.timer.setDebug(debug);
    }

    this.getMatches = function()        { return this.matches; }
    this.setMatches = function(matches) { this.matches = matches; }

    this.getTime = function() { return this.timer.getTime(); }
    this.timerIsRunning = function() { return this.timer.isRunning(); }
    this.resetTimer = function() { this.timer.reset(); }

    // Update the timer when a new page loads
    this.update = function(url) {
        var self = this;
        var debug = self.debug.debug;
        debug('Updating...');

        // The popup calls update when a change has been made to this.matches,
        // but the popup doesn't know the current URL. So, it passes null, and
        // we simply carry on as if it's changed.
        if (null !== url) {
            self.url = url; // Update the URL
            debug('New URL: ' + url);
        }

        // Stop timer, if it is running
        if (self.timer.isRunning()) {
            self.timer.stop();
        }

        // Determine if we also need to start the timer
        debug('Testing matches against url: ' + self.url);
        self.matches.forEach(function(element) {
            debug('Testing: ' + element);
            if (self.url.indexOf(element) !== -1) {
                // Start the timer
                debug('Matches: ' + element);
                self.timer.start();
            }
        });
    }
}

///////////////////////////////////////////////////////////////////////////////
// Main
///

// Called when the background script is installed. Initializes thePageClock.
var thePageClock = null;
chrome.runtime.onInstalled.addListener(function() {
    thePageClock = new PageClock(['developer.chrome.com']);
    // TODO: Unset debug
    thePageClock.setDebug(new Debugger(true));

    // Welcome message
    console.log('Installed PageClock v'
                + chrome.runtime.getManifest().version);
});

// Called whenever:
// - The Tab object experiences an update to its attributes
// - A different Tab becomes active.
function updatedListener(tabId, changeInfo, tab) {
    chrome.tabs.query({"active": true},
                      function(tabs) {
                          // TODO: Check that tabs has exactly one entry.
                          if (tabs[0].url != thePageClock.getUrl()) {
                              thePageClock.update(tabs[0].url);
                          }
                      });
}

// Set up event listeners.
// TODO: Run when browser is closed?
// TODO: Run if this window is no longer focused?
chrome.tabs.onUpdated.addListener(updatedListener);
chrome.tabs.onActivated.addListener(updatedListener);

///////////////////////////////////////////////////////////////////////////////
