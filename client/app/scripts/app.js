'use strict';

/**
 * @ngdoc overview
 * @name naturenurtureApp
 * @description
 * # naturenurtureApp
 *
 * Main module of the application.
 */
angular
  .module('naturenurtureApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'ngMap',
    'ngFileUpload',
    'truncate',
    '720kb.socialshare',
    // 'ui.tinymce'
  ])
  .controller('NavbarController', function ($scope,$location,auth) {
    $scope.getNavClass = function(path) {
      //console.log($location.path().substr(0, path.length));
      //console.log(path);
      return ($location.path().substr(0, path.length) === path) ? 'active' : '';
    }

    $scope.currentUser = function() {
      if(auth.getCurrentUserObj()){
        return auth.getCurrentUserObj().name;
      }
    }

    $scope.isLoggedIn = function() {
      //console.log(auth.isLoggedIn());
      return auth.isLoggedIn();

    }
    $scope.logout = function() {
      console.log("logging out");
      auth.logout();
    }
    $scope.toggle_menu = false;
    $scope.toggleMenu = function() {
      if ($scope.toggle_menu) {
        $scope.toggle_menu = false
      }
    }
  })
  .config(function ($routeProvider,$locationProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl',
        controllerAs: 'main'
      })
      .when('/about', {
        templateUrl: 'views/about.html',
        controller: 'AboutCtrl',
        controllerAs: 'about'
      })
      .when('/myroute', {
        templateUrl: 'views/myroute.html',
        controller: 'MyrouteCtrl',
        controllerAs: 'myroute'
      })
      .when('/green-exchange', {
        templateUrl: 'views/green-exchange.html',
        controller: 'GreenExchangeCtrl',
        controllerAs: 'greenExchange'
      })
      .when('/email-verified', {
        templateUrl: 'views/email-verified.html',
        controller: 'EmailVerifiedCtrl',
        controllerAs: 'emailVerified'
      })
      .when('/email-discarded', {
        templateUrl: 'views/email-discarded.html',
        controller: 'EmailDiscardedCtrl',
        controllerAs: 'emailDiscarded'
      })
      .when('/signup', {
        templateUrl: 'views/signup.html',
        controller: 'SignupCtrl',
        controllerAs: 'Signup'
      })
      .when('/logout', {
        templateUrl: 'views/logout.html',
        controller: 'LogoutCtrl',
        controllerAs: 'logout'
      })
      .when('/reset_password/:reset_code', {
        templateUrl: 'views/reset_password.html',
        controller: 'ResetPasswordCtrl',
        controllerAs: 'resetPassword'
      })
      .when('/forest', {
        templateUrl: 'views/forest.html',
        controller: 'ForestCtrl',
        controllerAs: 'forest'
      })
      .when('/post/:post_id', {
        templateUrl: 'views/post.html',
        controller: 'PostCtrl',
        controllerAs: 'post'
      })
      .when('/movement', {
        templateUrl: 'views/movement.html',
        controller: 'MovementCtrl',
        controllerAs: 'movement'
      })
      .otherwise({
        redirectTo: '/'
      });

      $locationProvider.html5Mode(true);
  });
