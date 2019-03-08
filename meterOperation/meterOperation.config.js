(function() {
  'use strict';
  angular
    .module('meterOperation')
    .config(['c8yViewsProvider', function(c8yViewsProvider) {
      c8yViewsProvider.when('/device/:deviceId', {
        name: '表具操作',
        icon: 'pencil-square-o',
        templateUrl: ':::PLUGIN_PATH:::/views/meterOperation.html',
        controller: 'meterOperationCtrl',
        showIf: ['$routeParams', 'c8yDevices', function($routeParams, c8yDevices) {
          return c8yDevices.detail($routeParams.deviceId).then(function(data) {
            if (data.data.type === 'LoraDevice') {
              return true
            } else {
              return false
            }
          })
        }]
      })
    }])
}());