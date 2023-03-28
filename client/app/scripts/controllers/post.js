'use strict';

/**
 * @ngdoc function
 * @name naturenurtureApp.controller:PostCtrl
 * @description
 * # PostCtrl
 * Controller of the naturenurtureApp
 */
angular.module('naturenurtureApp')
  .controller('PostCtrl', function ($scope, $http, config, $location, $window, post, $routeParams, auth) {
    $scope.$on('$viewContentLoaded', function(event) {
      $window.ga('send', 'pageview', { page: $location.url() });
    });
    this.init = function() {
      if ($routeParams.post_id) {
        $http.post(config.baseUrl + 'api/post/find_one',{ post_id: $routeParams.post_id }).then(function(res) {
          $scope.post = res.data;

        }, function(res) {
          $location.path("/forest");
        });

      }else {
        $location.path("/forest");
      }
      //var posts = this.posts

    }
    this.init();

    $scope.newlineToBr = function(string) {
      return String(string).replace(/(?:\r\n|\r|\n)/g, '<br />');
    }
    //
    //
    // generate post url
    //
    //
    $scope.postUrl = function (post) {
      return (config.baseUrl + 'post/'+ post._id)
    }
    //
    //
    // submit comment
    //
    //
    $scope.isLoggedIn = function() {
      //console.log(auth.isLoggedIn());
      return auth.isLoggedIn();

    }

    // $scope.isMyPost = function(post) {
    //   if (auth.getCurrentUserObj() && auth.getCurrentUserObj() !== null) {
    //     //console.log(post);
    //     if (post.instant === true) {
    //       return post.owner_email === auth.getCurrentUserObj().email
    //     }
    //     return post.owner._id === auth.getCurrentUserObj()._id
    //   }
    // }

    //
    //
    // submit comment
    //
    //

    $scope.submit_comment = function(post) {
      if (post.new_comment && (post.new_comment.body.trim() !== "")) {
        auth.getCurrentUser().then(function(res) {
          post.new_comment.pending = true;
          post.new_comment.owner = res._id;
          post.new_comment.type = 'comment';
          post.new_comment.parent = post._id;
          post.new_comment.discussion_id = post._id;
          //console.log(post.new_comment);
          $http.post(config.baseUrl + 'api/post/comment', {post: post.new_comment}).then(function(res) {
            //console.log(res);
            //$scope.posts.unshift(res.data);
            res.data.createdAt = new Date();
            post.comments.push(res.data)
            post.new_comment.pending = false;
            post.new_comment = {}
          });
          //post.new_comment = {}
        })
      }
      else {
        //console.log('empty');
      }
    }


  });
