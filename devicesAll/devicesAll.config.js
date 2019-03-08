(function () {
  'use strict';

  angular
    .module('myapp.devicesAll')
    .config(configure);

  /* @ngInject */
  function configure(
    mapScriptServiceProvider,
    c8yNavigatorProvider,
    c8yViewsProvider
  ) {
    mapScriptServiceProvider.setKey('ec94a5c7fb1acf789b258c99ef83af38');
    c8yNavigatorProvider.addNavigation({ // adds a menu item to the navigator with ...
      name: '首页', // ... the name *"travelRecord"*
      icon: 'home', // ... the cube icon (icons are provided by the great Font Awesome library and you can use any of their [icon names](http://fontawesome.io/icons/) without the *fa-* prefix here
      priority: 1999, // ... a priority of 100000, which means that all menu items with a priority lower than 100000 appear before this menu item and all with a priority higher than 100000 appear after this menu item
      path: 'home' // ... */travelRecord* as path
    });
    c8yViewsProvider.when('/home', { // when the path "/travelRecord" is accessed ...
      templateUrl: ':::PLUGIN_PATH:::/views/devicesAll.html', //  ... display our html file "travelRecord.html" inside the "views" folder of our plugin (the plugin's folder is represented using the magic string ```:::PLUGIN_PATH:::```, which is replaced by the actual path during the build process)
      controller: 'devicesAllCtrl'
    });
  }
}());
