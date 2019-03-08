(function() {
  'use strict';

  angular
    .module('myapp.deviceContact')
    .controller('deviceContactCtrl', DeviceContactController);

  /* @ngInject */
  function DeviceContactController($scope, $routeParams, c8yDevices, c8yAlert) {

    function load() {
      c8yDevices.detail($routeParams.deviceId).then(function (res) {
        var device = res.data;
        $scope.device.id = device.id;
        $scope.device.c8y_Contact = device.c8y_Contact;
      });
    }

    function save(device) {
      c8yDevices.save(device).then(onSave);
    }

    function onSave() {
      c8yAlert.success('Contact information successfully saved!');
    }

    $scope.save = save;
    $scope.device = {};

    load();
  }

}());
