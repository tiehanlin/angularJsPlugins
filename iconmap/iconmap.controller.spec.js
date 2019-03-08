describe('myapplication.iconmap: iconmapController', function testController() {
  var $rootScope;
  var $controller;
  var $q;
  var c8yInventory;
  var c8yBinary;

  var $scope;

  beforeEach(function beforeEach() {
    common.globalBeforeWithUI();
    module('myapplication.iconmap');

    inject(function injector(
      _$rootScope_,
      _$controller_,
      _$q_,
      _c8yInventory_,
      _c8yBinary_
    ) {
      $rootScope = _$rootScope_;
      $controller = _$controller_;
      $q = _$q_;
      c8yInventory = _c8yInventory_;
      c8yBinary = _c8yBinary_;
    });

    spyOn(c8yInventory, 'list');
    spyOn(c8yBinary, 'list');
  });

  function init(scopeBindings) {
    $scope = _.assign($rootScope.$new(), scopeBindings);

    console.log($controller('iconmapController', {
      $scope: $scope,
      $q: $q,
      c8yInventory: c8yInventory,
      c8yBinary: c8yBinary
    }));
  }

  function async(x) {
    return { then: function cb(success) { return success(x); } };
  }

  function asyncFailed(x) {
    return { then: function cb(success, error) { return error(x); } };
  }
});
