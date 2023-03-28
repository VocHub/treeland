'use strict';

/**
 * @ngdoc function
 * @name naturenurtureApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the naturenurtureApp
 */
angular.module('naturenurtureApp').controller('MainCtrl', function($scope, $http, config, auth, $q, $location, $window) {
  $scope.$on('$viewContentLoaded', function(event) {
    $window.ga('send', 'pageview', {page: $location.url()});
  });
  this.init = function() {

    //var posts = this.posts
    $http.get(config.baseUrl + 'api/post/top_stories').then(function(res) {
      $scope.top_stories = res.data;
      console.log($scope.top_stories);

    }, function(res) {
      console.log(res);
    });

  }
  this.init();
  $scope.login = function() {
    console.log($scope.user);
    auth.login($scope.user).then(function() {
      auth.getCurrentUser().then(function(res) {
        console.info(res);
        //$window.location.reload();

        $location.path("/forest");
      });
    });
  }
  $scope.isLoggedIn = function() {
    //console.log(auth.isLoggedIn());
    return auth.isLoggedIn();

  }
  //
  //
  // generate post url
  //
  //
  $scope.postUrl = function(post) {
    return (config.baseUrl + 'post/' + post._id)
  }
});
