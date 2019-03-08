(function () {
  'use strict';

  angular
  .module('myapp.weatherAdmin', [ 'myapp.weatherService' ])
  .config(configure);

  /* @ngInject */
  function configure(
    c8yNavigatorProvider,
    c8yViewsProvider,
    gettext
  ) {
    c8yNavigatorProvider.addNavigation({ // adds a menu item to the navigator with ...
      parent: gettext('Settings'), // ... the category *"Settings"*
      name: gettext('Weather'), // ... the name *"Weather"*
      path: 'weather', // ... */weather* as path
      icon: 'cloud' // ... the cloud icon (icons are provided by the great Font Awesome library and you can use any of their [icon names](http://fontawesome.io/icons/) without the *fa-* prefix here
    });

    c8yViewsProvider.when('/weather', { // when the path "/weather" is accessed ...
      templateUrl: ':::PLUGIN_PATH:::/views/weatherAdmin.html' //  ... display our html file "weatherAdmin.html" inside the "views" folder of our plugin (the plugin's folder is represented using the magic string ```:::PLUGIN_PATH:::```, which is replaced by the actual path during the build process)
    });
  }
}());
