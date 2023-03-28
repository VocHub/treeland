'use strict';

describe('Controller: ForestCtrl', function () {

  // load the controller's module
  beforeEach(module('naturenurtureApp'));

  var ForestCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ForestCtrl = $controller('ForestCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(ForestCtrl.awesomeThings.length).toBe(3);
  });
});
