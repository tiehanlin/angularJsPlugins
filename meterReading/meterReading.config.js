(function() {
	'use strict';

	angular
		.module('myapp.meterReading')
		.config(configure);

	/* @ngInject */
	function configure(
		c8yNavigatorProvider,
		c8yViewsProvider
	) {
		c8yViewsProvider.when('/device/:deviceId', {
			name: '表具',
			icon: "list",
			templateUrl: ':::PLUGIN_PATH:::/views/meterReading.html',
			controller: 'meterReadingCtrl as vm',
			showIf: ['$routeParams', 'c8yDevices', function($routeParams, c8yDevices) {
				var deviceId = $routeParams.deviceId;
				return c8yDevices.detailCached(deviceId).then(function(res) {
					var device = res.data;
					var type;
					res.data.type=="c8y_Collector"?type=true:type=false;
					//类型
					return device && type;
					// return true
				});
			}]
		})
	}
}());
