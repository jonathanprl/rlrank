#!/usr/bin/env node

'use strict';

var app = require('./express.js');
require('./routes.js')(app);

// var swiftping = require('./server/helpers/swiftping');
// var config = require('./config');
