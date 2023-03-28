'use strict';

// Development specific configuration
// ==================================
module.exports = {

  //global url
  url: 'http://localhost:9000/',

  data_dir: 'upload/',

  // MongoDB connection options
  mongo: {
    uri: 'mongodb://localhost/nn'
  },

  // Seed database on startup
  seedDB: true

};
