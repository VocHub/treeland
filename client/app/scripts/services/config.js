'use strict';

/**
 * @ngdoc service
 * @name naturenurtureApp.config
 * @description
 * # config
 * Factory in the naturenurtureApp.
 */
angular.module('naturenurtureApp')
  .factory('config', function () {

    return {
      baseUrl: "http://localhost:9000/"
      //baseUrl: "http://www.naturenurture.lk/"
    };
  });
