(function () {
  'use strict';

  angular
    .module('myapp.weather', [ 'myapp.weatherService' ])
    .config(configure);

  /* @ngInject */
  function configure(
    c8yComponentsProvider,
    gettext
  ) {
    c8yComponentsProvider.add({ // adds a menu item to the widget menu list with ...
      name: 'weather', // ... the identifier *"weather"* which has to be unique among the widgets in the application
      nameDisplay: gettext('Weather'), // ... the displayed name *"weather"*
      description: gettext('Shows the current weather at the location of a device'), // ... a description
      templateUrl: ':::PLUGIN_PATH:::/views/weather.main.html' // ... displaying *"weather.main.html"* when added to the dashboard
    });
  }
}());
