(function() {
	'use strict';

	angular
		.module('myapp.meterReadingSingle')
		.config(configure);

	/* @ngInject */
	function configure(
		c8yNavigatorProvider,
		c8yViewsProvider
	) {
		c8yViewsProvider.when('/device/:deviceId', {
			name: '单抄表',
			icon: "cloud",
			templateUrl: ':::PLUGIN_PATH:::/views/meterReadingSingle.html',
			controller: 'meterReadingSingle',
			showIf: ['$routeParams', 'c8yDevices', function($routeParams, c8yDevices) {
				var deviceId = $routeParams.deviceId;
				return c8yDevices.detailCached(deviceId).then(function(res) {
					var device = res.data;
					var type;
					res.data.type=="c8y_Meter"?type=true:type=false;
					//小区管理器类型
					return device && type;
				});
			}]

		})
	}
}());