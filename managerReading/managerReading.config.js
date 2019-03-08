(function() {
	'use strict';

	angular
		.module('myapp.managerReading')
		.config(configure);

	/* @ngInject */
	function configure(
		c8yNavigatorProvider,
		c8yViewsProvider
	) {
		c8yViewsProvider.when('/group/:groupId', {
			name: '管理机',
			icon: "list",
			templateUrl: ':::PLUGIN_PATH:::/views/managerReading.html',
			controller: 'managerReadingCtrl as vm',
			showIf: ['$routeParams', 'c8yInventory', function($routeParams, c8yInventory) {
				var groupId = $routeParams.groupId;
				return c8yInventory.detailCached(groupId).then(function(res) {
					var group = res.data;
					var type;
					res.data.c8y_AreaLevel=="3"?type=true:type=false;
					//小区类型
					return group && type;
					// return true
				});
			}]
		})
	}
}());
