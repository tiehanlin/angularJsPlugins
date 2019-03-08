(function() {
  'use strict';

  angular
    .module('myapp.deviceContact')
    .config(configure);

  /* @ngInject */
  function configure(c8yViewsProvider) {
    c8yViewsProvider.when('/device/:deviceId', {
      name: 'Contact',
      icon: 'envelope-o',
      priority: 1000,
      templateUrl: ':::PLUGIN_PATH:::/views/deviceContact.html',
      controller: 'deviceContactCtrl'
    });
  }

}());
