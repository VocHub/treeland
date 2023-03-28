/**
 * Express configuration
 */

'use strict';

var express = require('express');
var bodyParser = require('body-parser')
var morgan = require("morgan")
var passport = require("passport")

module.exports = {
  default: function(app) {

    app.use(morgan('dev'));
    // parse application/x-www-form-urlencoded
    app.use(bodyParser.urlencoded({
      extended: false
    }))
    // parse application/json
    app.use(bodyParser.json())
    app.use(passport.initialize());


  }
}
