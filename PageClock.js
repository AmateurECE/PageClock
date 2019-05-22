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

// TODO: Fix storage of time
// TODO: Fix storage of matches
// TODO: Fix timer snapshot
// TODO: Popup style sheet
// TODO: Date/time of last reset

///////////////////////////////////////////////////////////////////////////////
// Class: PageClock
///

function PageClock(matches) {
    // Instance attributes
    this.matches = matches;
    this.url = null;
    this.debug = new Debugger();
    this.timer = new Timer();

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
        self.url = url; // Update the URL
        debug('New URL: ' + url);

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
                          if (tabs.length != 1) {
                              console.warn("`tabs' has more than one entry.");
                          }
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
