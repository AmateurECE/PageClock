///////////////////////////////////////////////////////////////////////////////
// NAME:            background.js
//
// AUTHOR:          Ethan D. Twardy <edtwardy@mtu.edu>
//
// DESCRIPTION:     
//
// CREATED:         05/20/2019
//
// LAST EDITED:     05/22/2019
////

// TODO: Fix timer snapshot
// TODO: Popup style sheet

///////////////////////////////////////////////////////////////////////////////
// Class: PageClockSerializer
////

function PageClockSerializer() {
    this.matchName = 'PageClock.matches';

    // Read the matches from Chrome user storage.
    this.readMatches = function(pageClock) {
        var dict = {};
        dict[this.matchName] = [];
        chrome.storage.sync.get(dict, (matches) => {
            var self = this;
            // TODO: Remove this
            console.log(matches);
            if (typeof chrome.runtime.lastError !== 'undefined') {
                console.error(chrome.runtime.lastError);
                console.warn("Using empty array for `matches'");
                pageClock.matches = new Array();
            } else {
                pageClock.matches = matches[self.matchName];
            }
        });
    }

    // Write the current matches into Chrome user storage.
    this.writeMatches = function(pageClock) {
        var dict = {};
        dict[this.matchName] = pageClock.matches;
        chrome.storage.sync.set(dict, () => {
            if (typeof chrome.runtime.lastError !== 'undefined') {
                console.error(chrome.runtime.lastError);
            }
        });
    }
}

///////////////////////////////////////////////////////////////////////////////
// Class: PageClock
///

function PageClock(pageClockSerializer) {
    // Instance attributes
    this.matches = null;
    this.url = null;
    this.debug = new Debugger(true);

    // Initialize the Timer
    this.timerSerializer = new TimerSerializer();
    this.timer = new Timer(this.timerSerializer);

    // TODO: Move this info into Timer class.
    this.lastReset = new Date();

    // Read in matches info.
    this.pageClockSerializer = pageClockSerializer;
    this.pageClockSerializer.readMatches(this);

    // Getters and Setters
    this.getUrl = function()    { return this.url; }
    this.setUrl = function(url) { this.url = url; }

    this.getDebug = function()      { return this.debug; }
    this.setDebug = function(debug) {
        this.debug = debug;
        this.timer.setDebug(debug);
    }

    this.getMatches = function()        { return this.matches; }
    this.setMatches = function(matches) {
        this.matches = matches;
        this.pageClockSerializer.writeMatches(this);
    }

    this.getLastReset = function() { return this.lastReset; }

    // TODO: Remove these functions in lieu of this.getTimer()
    this.getTime = function() { return this.timer.getTime(); }
    this.timerIsRunning = function() { return this.timer.isRunning(); }
    this.resetTimer = function() {
        this.timer.reset();
        this.lastReset = new Date();
    }

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
var thePageClockSerializer = null;
var thePageClock = null;
chrome.runtime.onInstalled.addListener(function() {
    thePageClockSerializer = new PageClockSerializer();
    thePageClock = new PageClock(thePageClockSerializer);
    // TODO: Unset debug
    // thePageClock.setDebug(null);

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
                          // TODO: pass url as array to .update()
                          // `tabs' has more than one entry when there is more
                          // than one window. Since this is pretty common, we
                          // should be sure to account for it.
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
