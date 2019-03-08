(function() {
  'use strict';
  angular
    .module('tracking')
    .config(configure);

  function configure(mapScriptServiceProvider, c8yViewsProvider) {
    mapScriptServiceProvider.setKey('ec94a5c7fb1acf789b258c99ef83af38');
    c8yViewsProvider.when('/device/:deviceId', {
      name: 'Tracking',
      icon: 'crosshairs',
      templateUrl: ':::PLUGIN_PATH:::/views/tracking.html',
      controller: 'trackingCtrl',
      showIf: ['$routeParams', 'c8yDevices', function($routeParams, c8yDevices) {
        var deviceId = $routeParams.deviceId;
        return c8yDevices.detailCached(deviceId).then(function(res) {
          var device = res.data;
          return device && device.c8y_Position;
        });
      }]
    })
  }
}());