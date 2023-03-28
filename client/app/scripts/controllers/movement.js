'use strict';

/**
 * @ngdoc function
 * @name naturenurtureApp.controller:MovementCtrl
 * @description
 * # MovementCtrl
 * Controller of the naturenurtureApp
 */
angular.module('naturenurtureApp')
  .controller('MovementCtrl', function ($scope, Upload, $http, config, auth, $timeout, $location, $window, post, NgMap) {
    $scope.$on('$viewContentLoaded', function(event) {
      $window.ga('send', 'pageview', {page: $location.url()});
    });

    var vm = this;
    vm.types = "['establishment']";
    vm.placeChanged = function() {
      vm.place = this.getPlace();
      //console.log('location', vm.place.geometry.location);
      vm.map.setCenter(vm.place.geometry.location);
    }
    NgMap.getMap().then(function(map) {
      vm.map = map;
    });


    this.init = function() {

      //var posts = this.posts
      $http.get(config.baseUrl + 'api/plant/movements').then(function(res) {
        $scope.posts = res.data;
        //console.log($scope.posts);

      }, function(res) {
        //console.log(res);
      });

    }
    this.init();

    $scope.email_drop = false;

    $scope.isLoggedIn = function() {
      //console.log(auth.isLoggedIn());
      return auth.isLoggedIn();

    }

    $scope.submitMovement = function() {
      if ($scope.isLoggedIn()) {
        auth.getCurrentUser().then(function(res) {
          $scope.plant.instant = false;
          $scope.plant.owner = res._id;
          if ($scope.pform.plantForm.file.$valid && $scope.files && $scope.files.length) {
            $scope.uploadFiles($scope.files);
          }
          else {
            $scope.plant.plantLoading = true;

            $http.post(config.baseUrl + 'api/plant/movement', $scope.plant).then((function(a) {
              return function(res) {
                //console.log(res);
                $scope.posts.unshift(res.data);
                $scope.plant.plantLoading = false;
                $scope.plant = {}
                $scope.pform.plantForm.$setPristine();
              }

            })($scope.plant), function(res) {
              //console.log(res);
            });
          }
        });

      }else {
        // not demanding the username and email
        $scope.plant.instant = true;
        if ($scope.pform.plantForm.file.$valid && $scope.files && $scope.files.length) {
          $scope.uploadFiles($scope.files);
        }
        else {
          $scope.plant.plantLoading = true;

          $http.post(config.baseUrl + 'api/plant/movement', $scope.plant).then((function(a) {
            return function(res) {
              //console.log(res);
              $scope.posts.unshift(res.data);
              $scope.plant.plantLoading = false;
              $scope.plant = {}
              $scope.pform.plantForm.$setPristine();
            }

          })($scope.plant), function(res) {
            //console.log(res);
          });
        }

      }
      console.log($scope.plant);
    }

    // for multiple files:
    $scope.uploadFiles = function(files) {
      if ($scope.isLoggedIn()) {
        auth.getCurrentUser().then(function(res) {
          $scope.plant.owner = res._id;
          $scope.plant.instant = false;
          //console.log('---------------');
          if (files && files.length) {
            console.log(files);
            Upload.upload({
              url: config.baseUrl + 'api/plant/movement',
              arrayKey: '',
              data: {
                file: files,
                plant: $scope.plant
                //'username': $scope.username
              }
            }).then(function(resp) {
              //console.log('Success ' + resp.config.data.file.name + 'uploaded. Response: ' + resp.data);
              console.log(resp.data);
              $scope.posts.unshift(resp.data);
              $scope.postLoading = false;
              $scope.plant = {}
              $scope.pform.plantForm.$setPristine();
              $scope.files = [];
            }, function(resp) {
              console.log('Error status: ' + resp.status);
            }, function(evt) {
              var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
              $scope.progressPercentage = progressPercentage;
              console.log('progress: ' + $scope.progressPercentage + '% ' + evt.config.data.file.name);
            });
          }
        });
      }else {
        //$scope.plant.owner = res._id;
        // not demanding email
        $scope.plant.instant = true;
        if (files && files.length) {
          console.log(files);
          Upload.upload({
            url: config.baseUrl + 'api/plant/movement',
            arrayKey: '',
            data: {
              file: files,
              plant: $scope.plant
              //'username': $scope.username
            }
          }).then(function(resp) {
            //console.log('Success ' + resp.config.data.file.name + 'uploaded. Response: ' + resp.data);
            console.log(resp.data);
            $scope.posts.unshift(resp.data);
            $scope.postLoading = false;
            $scope.plant = {}
            $scope.pform.plantForm.$setPristine();
            $scope.files = [];
          }, function(resp) {
            console.log('Error status: ' + resp.status);
          }, function(evt) {
            var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
            $scope.progressPercentage = progressPercentage;
            console.log('progress: ' + $scope.progressPercentage + '% ' + evt.config.data.file.name);
          });
        }
      }

    }




  });
