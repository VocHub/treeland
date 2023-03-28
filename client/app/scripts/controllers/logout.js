'use strict';

/**
 * @ngdoc function
 * @name naturenurtureApp.controller:LogoutCtrl
 * @description
 * # LogoutCtrl
 * Controller of the naturenurtureApp
 */
angular.module('naturenurtureApp')
  .controller('LogoutCtrl', function (auth,$location) {
    auth.logout();
    $location.path("/")
  });
