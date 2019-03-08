(function() {
	'use strict';

	angular
		.module('myapp.collectorReading')
		.config(configure);

	/* @ngInject */
	function configure(
		c8yNavigatorProvider,
		c8yViewsProvider
	) {
		c8yViewsProvider.when('/device/:deviceId', {
			name: '集中器',
			icon: "list",
			templateUrl: ':::PLUGIN_PATH:::/views/collectorReading.html',
			controller: 'collectorReadingCtrl as vm',
			showIf: ['$routeParams', 'c8yDevices', function($routeParams, c8yDevices) {
				var deviceId = $routeParams.deviceId;
				return c8yDevices.detailCached(deviceId).then(function(res) {
					var device = res.data;
					var type;
					res.data.type=="c8y_Manager"?type=true:type=false;
					//小区管理器类型
					return device && type;
					// return true
				});
			}]
		})
	}
}());
