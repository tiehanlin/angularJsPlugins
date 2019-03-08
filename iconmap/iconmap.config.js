(function () {
  'use strict';

  angular
    .module('myapp.iconmap')
    .config(configure);

  /* @ngInject */
  function configure(
    c8yComponentsProvider,
    gettext
  ) {
    c8yComponentsProvider.add({ // adds a menu item to the widget menu list with ...
      name: 'iconmap', // ... the identifier *"iconmap"* which has to be unique among the widgets in the application
      nameDisplay: gettext('Icon Map'), // ... the displayed name *"Icon Map"*
      description: gettext('Displays a map with icons for devices instead of markers'), // ... a description
      templateUrl: ':::PLUGIN_PATH:::/views/iconmap.main.html', // ... displaying *"iconmap.main.html"* when added to the dashboard
      options: { noDeviceTarget: true }
    });
  }
}());
