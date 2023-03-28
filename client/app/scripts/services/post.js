'use strict';

/**
 * @ngdoc service
 * @name naturenurtureApp.post
 * @description
 * # post
 * Factory in the naturenurtureApp.
 */
angular.module('naturenurtureApp')
  .factory('post', function () {
    // Service logic
    // ...

    var post = {d:'d'};

    // Public API here
    return {
      getPost: function () {
        console.log('get');
        return post;

      },
      setPost: function (p) {
        post = p;
        console.log('set');
        console.log(post);
      }
    };
  });
