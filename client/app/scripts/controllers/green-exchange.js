'use strict';

/**
 * @ngdoc function
 * @name naturenurtureApp.controller:GreenExchangeCtrl
 * @description
 * # GreenExchangeCtrl
 * Controller of the naturenurtureApp
 */
angular.module('naturenurtureApp').controller('GreenExchangeCtrl', function($scope, NgMap, $http, config, auth, $location, $window) {
  $scope.$on('$viewContentLoaded', function(event) {
    $window.ga('send', 'pageview', {page: $location.url()});
  });
  $scope.posts = []
  //
  //
  //plant form population
  //prepare for $setPristine
  //
  //
  $scope.pform = {};

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

  $scope.collapse = false;
  $scope.doCollapse = function functionName() {
    $scope.collapse = !$scope.collapse;
    //console.log($scope.collapse);
  }

  $scope.plant = {}
  $scope.submitForm = function() {
    console.log("regular");
    var plant = $scope.plant;
    auth.getCurrentUser().then(function(res) {
      console.info(res);
      //return;
      plant.owner = res._id;
      $scope.plant.plantLoading = true;

      //console.log($scope.plant);
      $http.post(config.baseUrl + 'api/plant/', $scope.plant).then((function(a) {
        return function(res) {
          //console.log(res);
          $scope.posts.unshift(res.data);
          plant.plantLoading = false;
          $scope.plant = {}
          $scope.plant.type = 'Exchange';
          $scope.pform.plantForm.$setPristine();
        }

      })($scope.plant), function(res) {
        //console.log(res);
      });
    });

  }
  $scope.submitInstantForm = function() {
    console.log("instant");
    var plant = $scope.plant;
    plant.instant = true;
    $http.post(config.baseUrl + 'api/plant/', $scope.plant).then((function(a) {
      return function(res) {
        //console.log(res);
        $scope.posts.unshift(res.data);
        plant.plantLoading = false;
        $scope.plant = {}
        $scope.plant.type = 'Exchange';
        $scope.pform.plantForm.$setPristine();
      }

    })($scope.plant), function(res) {
      //console.log(res);
    });

  }
  //var init_obj = this;
  this.init = function() {
    //var posts = this.posts
    $http.get(config.baseUrl + 'api/plant/').then(function(res) {

      $scope.posts = res.data;
      //console.log($scope.posts);

    }, function(res) {
      //console.log(res);
    });
  }
  this.init();
  //
  //
  //checking post type
  //
  //
  $scope.plant.type = 'Exchange';

  //var type_obj = this;
  //console.log(type_obj.plant.type);
  $scope.checkType = function(string) {
    //console.log(type_obj.plant.type);
    return $scope.plant.type == string
      ? 'active'
      : '';
  }
  //
  // set post type with tabs
  //
  $scope.typeTabClick = function(str) {
    $scope.plant.type = str
  }

  $scope.getPostType = function(str) {
    return str
  }

  //
  //
  // bid on a posted item
  //
  //
  $scope.submitResponse = function(post, obj) {
    //console.log('FORM - '+$scope.a);
    //console.log($scope.isLoggedIn());
    if ($scope.isLoggedIn()) {
      auth.getCurrentUser().then(function(res) {

        var loading = post.responseLoading = true;
        post.new_response.owner = res._id;
        //console.log(post.new_response);

        $http.post(config.baseUrl + 'api/plant/response', {
          id: post._id,
          response: post.new_response
        }).then((function(post, $scope) {
          return function(res) {
            //console.log(res);
            post.responseLoading = false;

            //console.log($scope.responseForm);
            post.new_response = {};
            obj.$setPristine();

            post.responses = res.data.responses;

            post.response_form_class = '';
            //console.log(post);
          }

        })(post, $scope), function(res) {
          //console.log(res);
        });

      });
    } else {
      post.new_response.owner = 'guest';
      $http.post(config.baseUrl + 'api/plant/response', {
        id: post._id,
        response: post.new_response
      }).then((function(post, $scope) {
        return function(res) {
          //console.log(res);
          post.responseLoading = false;

          //console.log($scope.responseForm);
          post.new_response = {};
          obj.$setPristine();

          post.responses = res.data.responses;

          post.response_form_class = '';
          //console.log(post);
        }

      })(post, $scope), function(res) {
        //console.log(res);
      });

    }

  }
  //
  //
  //collapse sign up form
  //
  //
  $scope.isSignUpCollapse = false;
  $scope.signUpCollapse = function() {
    $scope.isSignUpCollapse = !$scope.isSignUpCollapse
  }
  //
  //
  //signup
  //
  //
  $scope.signUp = function() {
    $scope.user.name = $scope.user.first_name.toLowerCase();
    //console.log($scope.user);
    auth.createUser($scope.user).then(function(res) {

      if (res.hasOwnProperty('role')) {
        $scope.verify_email_notification = true;
      } else if (res.status == 422) {
        $scope.duplicate_email = true;
      }

    })

  }
  //
  //
  //isLoggedIn
  //
  //
  $scope.isLoggedIn = function() {
    //console.log(auth.isLoggedIn());
    return auth.isLoggedIn();

  }
  //
  //
  //get current user and check for his/her posts
  //make them editable
  //
  //
  $scope.isMyPost = function(post) {
    if (auth.getCurrentUserObj() && auth.getCurrentUserObj() !== null) {
      //console.log(post);
      if (post.instant === true) {
        return post.owner_email === auth.getCurrentUserObj().email
      }
      return post.owner._id === auth.getCurrentUserObj()._id
    }
  }
  //
  //
  //edit a post marked my_post
  //
  //
  $scope.edit = function(post) {
    post.shadow = $scope.getShadow(post);
    post.editing = true;
    //console.log(post);
  }

  $scope.editCancel = function(post) {
    //console.log(post);
    post.shadow = {}
    post.editing = false;
  }

  $scope.getShadow = function(obj) {
    if (null == obj || "object" != typeof obj)
      return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
      if (obj.hasOwnProperty(attr))
        copy[attr] = obj[attr];
      }
    return copy;
  }
  //
  //
  //submit edit form to API
  //
  //
  $scope.submitEditForm = function(post) {
    post.shadow.editInProgress = true;

    //delete unnessersary properties
    delete post.shadow.responseForm;
    delete post.shadow.responses;

    $http.put(config.baseUrl + 'api/plant/' + post._id, post.shadow).then(function(res) {
      //console.log(post);
      post.shadow.editInProgress = false
      post.shadow = {}
      post.editing = false;

      post.name = res.data.name;
      post.address = res.data.address;
      post.description = res.data.description;
      post.quantity = res.data.quantity;
    });
  }
  //
  //
  //get my posts
  //
  //
  $scope.getMyPlants = function() {
    auth.getCurrentUser().then(function(res) {
      //console.log(res.name);
      $http.get(config.baseUrl + 'api/plant/user/' + res._id).then(function(res) {

        $scope.posts = res.data;
        //console.log($scope.posts);

      }, function(res) {
        //console.log(res);
      });

    })
  }
  //
  //
  // get all posts
  //
  //
  $scope.getAllPosts = function() {
    $http.get(config.baseUrl + 'api/plant/').then(function(res) {

      $scope.posts = res.data;
      //console.log($scope.posts);

    }, function(res) {
      //console.log(res);
    });
  }
  //
  //
  //maintin side-bar state
  //
  //
  $scope.isMenuItemActive = function(str) {
    if ($scope.currentSidebarItem) {
      //console.log(str);
      //console.log($scope.currentSidebarItem === str);
      return $scope.currentSidebarItem === str;
    } else {
      $scope.currentSidebarItem = "all_plants";
      return $scope.currentSidebarItem;
    }
  }
  //
  //
  // get contact_info
  //
  //
  $scope.getContactInfo = function(response) {

    console.log(response._id);
    if (response.contact_info) {
      return;
    }
    response.contactLoading = true;
    $http.get(config.baseUrl + 'api/plant/response/' + response._id).then(function(res) {
      response.contact_info = res.data.contact_info;
      //console.log(response);
      response.contactLoading = false;
    }, function(res) {
      //console.log(res);
    });
  }
  //
  //
  // search
  //
  //
  $scope.search = function() {
    //console.log($scope.search_text);
    var str = "";
    str = $scope.search_text;
    // var keywords = str.split(" ").slice(0,7);
    // console.log(keywords);

    if (str !== "") {
      $http.get(config.baseUrl + 'api/plant/search/' + str).then(function(res) {

        //console.log(res.data);
        $scope.posts = res.data;
        //response.contactLoading = false;

      }, function(res) {
        //console.log(res);
      });
    }

  }
  //
  //
  // get my bids
  //
  //
  $scope.getMyBids = function() {
    auth.getCurrentUser().then(function(res) {
      //console.log(res.name);
      $http.get(config.baseUrl + 'api/plant/user/bids/' + res._id).then(function(res) {

        $scope.posts = res.data;
        //console.log($scope.posts);

      }, function(res) {
        //console.log(res);
      });

    })
  }
  //
  //
  // delete plant
  //
  //
  $scope.deletePost = function(post) {
    $http.delete(config.baseUrl + 'api/plant/' + post._id).then(function(res) {

      //$scope.posts = res.data;
      //console.log(res.data);
      if (res.data.status === 'deleted') {
        post.prompt_delete = false;
      }

    }, function(res) {
      //console.log(res);
    });
  }
  //
  //
  // prompt before deleting post
  //
  //
  $scope.promptDelete = function(post) {
    post.prompt_delete = true;
  }
  //
  //
  // report a post
  //
  //
  $scope.report = function(post) {
    console.log(post._id);
    $http.post(config.baseUrl + 'api/plant/report/' + post._id).then(function(res) {

      //$scope.posts = res.data;

      if (res.data.status === 'review') {
        console.log(res);
      }

    }, function(res) {
      //console.log(res);
    });
  }
  //
  //
  // mark a post as closed
  //
  //
  $scope.markAsClosed = function(post) {
    $http.post(config.baseUrl + 'api/plant/close/' + post._id).then(function(res) {

      //$scope.posts = res.data;
      console.log(res);
      if (res.data.status === 'closed') {
        post.prompt_close = false;
      }

    }, function(res) {
      //console.log(res);
    });
  }
  $scope.promptClose = function(post) {
    post.prompt_close = true;
  }

  //
  //
  //toggle_sidebar
  //
  //
  $scope.toggle_sidebar = false;
});
