///////////////////////////////////////////////////////////////////////////////
// NAME:            Debugger.js
//
// AUTHOR:          Ethan D. Twardy <edtwardy@mtu.edu>
//
// DESCRIPTION:     Contains a class to control access to debug logs.
//
// CREATED:         05/21/2019
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
