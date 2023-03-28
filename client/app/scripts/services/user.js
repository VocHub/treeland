'use strict';

/**
 * @ngdoc service
 * @name naturenurtureApp.User
 * @description
 * # User
 * Factory in the naturenurtureApp.
 */
angular.module('naturenurtureApp')
  .factory('User', function () {


    // Public API here
    return {
      signUp: function () {
        
        return meaningOfLife;
      }
    };
  });
