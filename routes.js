/**
 * Main application routes
 */

'use strict';

//import errors from './components/errors';
var path = require('path');
var express = require('express');
var config = require('./config/environment');

module.exports = {
  default: function(app) {
    app.use(express.static('client/app'));
    app.use('/upload',express.static(config.data_dir));
    app.use('/bower_components',express.static('client/bower_components'));
    // Insert routes below
    app.use('/api/plant', require('./api/plant'));
    app.use('/api/users', require('./api/user'));
    app.use('/api/post', require('./api/post'));

    app.use('/auth', require('./auth'));

    // // All undefined asset or api routes should return a 404
    // app.route('/:url(api|auth|components|app|bower_components|assets)/*')
    //  .get(errors[404]);
    // viewed at http://localhost:8080
    // app.get('/', function(req, res) {
    //
    // });
    // All other routes should redirect to the index.html
    app.route('/*')
      .get((req, res) => {
        res.sendFile(path.join(__dirname + '/client/app/index.html'));
      });
  }
}
