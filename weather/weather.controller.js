(function () {
  'use strict';

  angular
  .module('myapp.weather')
  .controller('weatherController', weatherController);

  /* @ngInject */
  function weatherController(
    $scope,
    $q,
    weatherService,
    gettext,
    c8yInventory
  ) {
    $scope.$watch('child.config.device', function reInit(newVal, oldVal) {
      if (newVal && !angular.equals(newVal, oldVal)) {
        init();
      }
    }, true);
    init();

    function init() {
      weatherService.load().then(getDevice).then(tryGetWeather).then(showWeather, printError);
    }

    function getDevice() {
      var deviceId = $scope.child.config.device.id;
      $scope.status = gettext('Retrieving device ...');
      return c8yInventory.detail(deviceId);
    }

    function tryGetWeather(res) {
      $scope.device = res.data;

      if (locationAvailable($scope.device)) {
        $scope.status = gettext('Retrieving weather ...');
        return getWeather($scope.device.c8y_Position);
      }

      $scope.status = gettext('Device has not reported a location, cannot retrieve weather.');
      return $q.reject();
    }

    function locationAvailable(device) {
      return device && device.c8y_Position && device.c8y_Position.lat && device.c8y_Position.lng;
    }

    function getWeather(coordinate) {
      return weatherService.weather.getCurrent(coordinate.lat, coordinate.lng);
    }

    function showWeather(weather) {
      $scope.weather = weather;
      $scope.windDirection = {
        'display': 'inline-block',
        '-ms-transform': rotate(weather),
        '-webkit-transform': rotate(weather),
        'transform': rotate(weather)
      };
      $scope.status = 'ready';
    }

    function printError() {
      $scope.status = gettext('Error retrieving weather information.');
    }

    function rotate(weather) {
      var direction = (weather.currently.windBearing + 180) % 360;
      return 'rotate(' + direction + 'deg)';
    }
  }
}());
