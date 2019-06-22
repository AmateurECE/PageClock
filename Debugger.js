///////////////////////////////////////////////////////////////////////////////
// NAME:            Debugger.js
//
// AUTHOR:          Ethan D. Twardy <edtwardy@mtu.edu>
//
// DESCRIPTION:     Contains a class to control access to debug logs.
//
// CREATED:         05/21/2019
//
// LAST EDITED:     06/22/2019
////

'use strict';

///////////////////////////////////////////////////////////////////////////////
// Class: Debugger
////

export class Debugger {
    constructor(debugState) {
        this.debugState = (false || debugState);
    }

    debug(string) {
        if (this.debugState) {
            console.log(string);
        }
    }
}

///////////////////////////////////////////////////////////////////////////////
