'use strict';

describe('Controller: GreenExchangeCtrl', function () {

  // load the controller's module
  beforeEach(module('naturenurtureApp'));

  var GreenExchangeCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    GreenExchangeCtrl = $controller('GreenExchangeCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(GreenExchangeCtrl.awesomeThings.length).toBe(3);
  });
});
