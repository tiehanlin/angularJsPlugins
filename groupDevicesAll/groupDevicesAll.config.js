(function() {
  'use strict';
  angular
    .module('myapp.groupDevicesAll')
    .config(configure);

  function configure(mapScriptServiceProvider, c8yViewsProvider) {
    mapScriptServiceProvider.setKey('ec94a5c7fb1acf789b258c99ef83af38');
    c8yViewsProvider.when('/group/:groupId', {
      name: '首页',
      icon: 'envelope-o',
      priority: 1e4+1,
      templateUrl: ':::PLUGIN_PATH:::/views/groupDevicesAll.html',
      controller: 'groupDevicesAllCtrl'
    });
  }
}());