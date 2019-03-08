(function () {
  'use strict';

  angular
    .module('myapp.companyInfo')
    .config(configure);

  /* @ngInject */
  function configure(
    c8yNavigatorProvider,
    c8yViewsProvider
  ) {
    c8yNavigatorProvider.addNavigation({ // adds a menu item to the navigator with ...
      name: '欢迎', // ... the name *"companyInfo"*
      icon: 'cloud', // ... the cube icon (icons are provided by the great Font Awesome library and you can use any of their [icon names](http://fontawesome.io/icons/) without the *fa-* prefix here
      priority: 2000, // ... a priority of 100000, which means that all menu items with a priority lower than 100000 appear before this menu item and all with a priority higher than 100000 appear after this menu item
      path: '' // ... */companyInfo* as path
    });

    c8yViewsProvider.when('/', { // when the path "/companyInfo" is accessed ...
      templateUrl: ':::PLUGIN_PATH:::/views/companyInfo.main.html', //  ... display our html file "companyInfo.html" inside the "views" folder of our plugin (the plugin's folder is represented using the magic string ```:::PLUGIN_PATH:::```, which is replaced by the actual path during the build process)
      controller: 'companyInfoController', // ... use "companyInfoController" as controller
      controllerAs: 'vm'
    });
  }
}());
