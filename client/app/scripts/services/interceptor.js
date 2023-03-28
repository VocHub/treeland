'use strict';

/**
 * @ngdoc service
 * @name naturenurtureApp.interceptor
 * @description
 * # interceptor
 * Factory in the naturenurtureApp.
 */
angular.module('naturenurtureApp')
  .factory('interceptor', function($rootScope, $q, $cookies, $injector, $location) {
      return {
        request: function(config) {
          //console.log("thru");
          config.headers = config.headers || {};
            if ($cookies.get('token')) {
            //console.log("INTERCEPTOR "+$cookies.get('token'));
            config.headers.authorization = 'Bearer ' + $cookies.get('token');
          }
        return config;
      },

      requestError: function(config) {

          return config;
        },

        response: function(res) {
          return res;
        },

        responseError: function(res) {
          if (res.status === 401) {
            $location.url("/login")
              // remove any stale tokens
            $cookies.remove('token');
          }
          return res;
        }
    }

  }
)
.config(function($httpProvider) {
  $httpProvider.interceptors.push('interceptor');
})
