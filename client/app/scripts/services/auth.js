'use strict';

/**
 * @ngdoc service
 * @name naturenurtureApp.auth
 * @description
 * # auth
 * Factory in the naturenurtureApp.
 */
angular.module('naturenurtureApp').factory('auth', function($location, $http, $cookies, $q, config) {

  var currentUser = {}
  var capitalizeFirstLetter = function(string) {
    var words = string.split(" ")
    for (var i = 0; i < words.length; i++) {
      words[i] = words[i].charAt(0).toUpperCase() + words[i].slice(1);
    }
    return words.join(' ');
  }
  var promise = $q(function(resolve, reject) {
    if ($cookies.get('token') && $location.path() !== '/logout') {
      $http.get(config.baseUrl + 'api/users/me').then(function(res) {
        //console.log(res);
        //res.data.name = capitalizeFirstLetter(res.data.name);
        currentUser = res.data
        resolve(res.data)

        //console.log(currentUser);

      }, function(res) {});

    }
  });
  promise.then(function(user) {
    currentUser = user;
    //console.log(user);
  })
  var safeCb = function(cb) {
    return angular.isFunction(cb)
      ? cb
      : angular.noop;
  }

  // Public API here
  return {
    login: function({
      email,
      password
    }, callback) {
      return $http.post('/auth/local', {
        email: email,
        password: password
      }).then(function(res) {
        $cookies.put('token', res.data.token);
      }).then(function(user) {
        safeCb(callback)(null, user);
        return user;
      }).catch(function(err) {
        Auth.logout();
        safeCb(callback)(err.data);
        return $q.reject(err.data);
      });
    },
    logout: function() {
      $cookies.remove('token');
      currentUser = {};
    },
    createUser: function(user) {
      //console.log("creating user");
      user.name = capitalizeFirstLetter(user.name);
      return $http.post(config.baseUrl + 'api/users/', user).then(function(data) {
        //console.log(data);
        if (data.status !== 422) {
          $cookies.put('token', data.data.token);
          return $http.get(config.baseUrl + 'api/users/me').then(function(res) {
            //console.log(res);
            currentUser = res.data;
            return res.data;

          }, function(res) {});
        } else {
          return {status: 422}
        }

        //currentUser = res

      }, function(res) {});

    },
    getCurrentUserObj: function() {
      if (currentUser.hasOwnProperty('role')) {
        return currentUser;
      }
    },
    getCurrentUser: function() {

      // if (arguments.length === 0) {
      //   return currentUser;
      // }
      if ($cookies.get('token') && $location.path() !== '/logout') {
        return $http.get(config.baseUrl + 'api/users/me').then(function(res) {
          //res.data.name = capitalizeFirstLetter(res.data.name);
          currentUser = res.data
          //console.log(currentUser);

          return res.data

          //console.log(currentUser);

        }, function(res) {});

      } else {
        return "Not logged in."
      }
    },
    isLoggedIn: function() {

      return currentUser.hasOwnProperty('role');

    }

  };
});
