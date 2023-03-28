'use strict';

/**
 * @ngdoc function
 * @name naturenurtureApp.controller:SignupCtrl
 * @description
 * # SignupCtrl
 * Controller of the naturenurtureApp
 */
angular.module('naturenurtureApp')
  .controller('SignupCtrl', function ($scope,$http,config,auth, $location, $window) {
    $scope.$on('$viewContentLoaded', function(event) {
      $window.ga('send', 'pageview', {page: $location.url()});
    });
    $scope.signUp = function() {
      $scope.user.name = $scope.user.first_name.toLowerCase();
      //console.log($scope.user);
      auth.createUser($scope.user).then(function(res) {

        if (res.hasOwnProperty('role')) {
          $scope.verify_email_notification = true;
        }else if (res.status == 422) {
          $scope.duplicate_email = true;
        }

      })
    }

  });
