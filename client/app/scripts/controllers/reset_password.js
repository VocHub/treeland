'use strict';

/**
 * @ngdoc function
 * @name naturenurtureApp.controller:ResetPasswordCtrl
 * @description
 * # ResetPasswordCtrl
 * Controller of the naturenurtureApp
 */
angular.module('naturenurtureApp').controller('ResetPasswordCtrl', function($scope, $http, config, $routeParams, $location, $window) {
  $scope.resetFormView = false;
  $scope.reset_mail_pending = false;
  $scope.reset_data_pending = false;
  $scope.$on('$viewContentLoaded', function(event) {
    $window.ga('send', 'pageview', {page: $location.url()});
  });
  $scope.$on('$routeChangeSuccess', function() {
    //console.log($routeParams.reset_code == '0');
    if ($routeParams.reset_code == '0') {
      $scope.resetFormView = false;
    }else {
      $scope.resetFormView = true;
    }
  });
  this.init = function() {

    // if($routeParam.reset_code === 0){
    //   console.log("email form");
    // }
  }
  $scope.reset_password = function() {
    $scope.reset_mail_pending = false;
    $scope.reset_data_pending = false;
    //console.log($scope.resetRequest.email);
    $scope.reset_mail_pending = true;
    $http.get(config.baseUrl + 'api/users/reset_password_request/' + $scope.resetRequest.email).then(function(res) {

      //$scope.posts = res.data;
      //console.log(res.status);
      if (res.status != 204) {
        $scope.reset_link_error = true;
      }else{
        $scope.reset_link_success = true;
      }
      $scope.reset_mail_pending = false;

    }, function(res) {
      //console.log(res);
      $scope.reset_mail_pending = false;
    });
  }
  $scope.reset_password_send_data = function() {
    //console.log($routeParams.reset_code );
    $scope.reset_data_pending = true;
    if($routeParams.reset_code != '0'){
      $http.post(config.baseUrl + 'api/users/reset_password_request/',
      {
        id: $routeParams.reset_code,
        password: $scope.resetData.password
      }).then(function(res) {

      //$scope.posts = res.data;
      //console.log(res.data);
      if (res.status != 204) {
        $scope.reset_data_error = true;
      }else{
        $scope.reset_data_success = true;
      }
      $scope.reset_data_pending = false;

    }, function(res) {
      //console.log(res);
      $scope.reset_data_pending = false;
    });
  }
  }
});
