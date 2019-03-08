(function () {
  'use strict';

  angular
    .module('myapp.hello')
    .controller('HelloController', HelloController);

  /* @ngInject */
  function HelloController() {
    var vm = this;

    vm.text = 'hello, world';
  }
}());
