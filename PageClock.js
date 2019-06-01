///////////////////////////////////////////////////////////////////////////////
// NAME:            PageClock.js
//
// AUTHOR:          Ethan D. Twardy <edtwardy@mtu.edu>
//
// DESCRIPTION:     
//
// CREATED:         05/20/2019
//
// LAST EDITED:     05/31/2019
////

// TODO: Popup style sheet

///////////////////////////////////////////////////////////////////////////////
// Common Functions
////

// Return true if obj contains no real data.
function isEmpty(obj) {
    return obj === null || typeof obj === 'undefined'
        || (Object.entries(obj).length === 0
            && obj.constructor === Object);
}

// Return true if the arrays are equal.
function arraysEqual(a, b) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length != b.length) return false;

    a.sort();
    b.sort();

    for (var i = 0; i < a.length; ++i) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}

///////////////////////////////////////////////////////////////////////////////
// Class: PageClockSerializer
////

function PageClockSerializer() {
    this.matchName = 'matches';

    // Read the matches from Chrome user storage.
    this.readMatches = function(pageClock) {
        chrome.storage.local.get(this.matchName, (matches) => {
            var self = this;

            pageClock.debug.debug('Reading matches from storage...');
            if (isEmpty(matches)) {
                if (typeof chrome.runtime.lastError !== 'undefined') {
                    console.error(chrome.runtime.lastError);
                }
                console.warn("Using empty array for `matches'");
                pageClock.matches = new Array();
                self.writeMatches(pageClock);
            } else {
                pageClock.matches = matches[self.matchName];
            }
        });
    }

    // Write the current matches into Chrome user storage.
    this.writeMatches = function(pageClock) {
        var dict = {};
        dict[this.matchName] = pageClock.matches;
        chrome.storage.local.set(dict, () => {
            pageClock.debug.debug('Writing matches to storage...');
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
    this.urls = [];
    this.debug = new Debugger(true);

    // Initialize the Timer
    this.timerSerializer = new TimerSerializer();
    this.timer = new Timer(this.timerSerializer);


    // Read in matches info.
    this.pageClockSerializer = pageClockSerializer;
    this.pageClockSerializer.readMatches(this);

    // Getters and Setters
    this.getUrls = function()    { return this.urls; }
    this.setUrls = function(urls) { this.urls = urls; }

    this.getDebug = function()      { return this.debug; }
    this.setDebug = function(debug) {
        this.debug = debug;
        this.timer.setDebug(debug);
    }

    this.getMatches = function()        { return this.matches; }
    this.setMatches = function(matches) {
        this.matches = matches;
        this.filteredUpdate(forced=true);
        this.pageClockSerializer.writeMatches(this);
    }

    this.getTimer = function() { return this.timer; }

    // Update the timer when a new page loads
    this.update = function(urls, forced=false) {
        var self = this;
        var debug = self.debug.debug;
        debug('Urls: ' + urls);
        debug('Self: ' + self.urls);
        if (arraysEqual(urls, self.urls) && !forced) {
            debug('Arrays are equal, no update performed.');
            return;
        }

        debug('Updating...');
        self.urls = urls;

        // Determine if this update matches, start the timer if it's not
        // already running.
        for (let i = 0; i < self.urls.length; i++) {
            debug('Testing URL: ' + self.urls[i]);
            for (let j = 0; j < self.matches.length; j++) {
                if (self.urls[i].indexOf(self.matches[j]) !== -1) {
                    // Found a match
                    debug('Matches Rule: ' + self.matches[j]);
                    if (!self.timer.isRunning()) {
                        self.timer.start();
                    }
                    return;
                }
            }
        }

        // If we got to here, we need to stop the timer.
        self.timer.stop();
    }

    // Filter the array of Tab objects and invoke .update() to update the state
    // of the timer.
    this.filteredUpdate = function(forced=false) {
        chrome.tabs.query({'active': true}, (tabs) => {
            var self = this;
            var filteredUrls = [];
            var semaphore = tabs.length;

            // Create an event--The Chrome API doesn't seem to handle the
            // combination of callbacks and promises very well.
            var promise = new Event('PageClock.promise');
            const promiseHandler = (e) => {
                // This is actually executed AFTER the event is dispatched
                // (below)
                self.update(filteredUrls, forced=forced);
                document.removeEventListener('PageClock.promise',
                                             promiseHandler);
            }

            document.addEventListener('PageClock.promise', promiseHandler);
            for (let i = 0; i < tabs.length; i++) {
                chrome.windows.get(tabs[i].windowId, undefined, (window) => {
                    // The tab goes into the filteredUrls array iff the
                    // window is focused OR the tab is playing audio
                    if (tabs[i].audible || window.focused) {
                        filteredUrls.push(tabs[i].url);
                    }

                    semaphore -= 1; // Signal that we've finished.
                    if (!semaphore) {
                        document.dispatchEvent(promise);
                    }
                });
            }
        });
    }
}

///////////////////////////////////////////////////////////////////////////////
// Main
///

// Called when the background script is installed. Initializes thePageClock.
var thePageClockSerializer = new PageClockSerializer();
var thePageClock = new PageClock(thePageClockSerializer);
thePageClock.filteredUpdate();
// TODO: Unset debug
// thePageClock.setDebug(null);

// Print a cute little welcome message
chrome.runtime.onInstalled.addListener(function() {
    // Welcome message
    console.log('Installed PageClock v'
                + chrome.runtime.getManifest().version);
});

// Called whenever:
// - The Tab object experiences an update to its attributes
// - A different Tab becomes active.
function updatedListener(tabId, changeInfo, tab) {
    thePageClock.filteredUpdate();
}

// Set up event listeners.
// TODO: Stop timer when chrome is closed.
chrome.tabs.onUpdated.addListener(updatedListener);
chrome.tabs.onActivated.addListener(updatedListener);
chrome.windows.onFocusChanged.addListener(updatedListener);

///////////////////////////////////////////////////////////////////////////////
