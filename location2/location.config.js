(function() {
	'use strict';

	angular
		.module('myapp.location')
		.config(configure);

	/* @ngInject */
	function configure(mapScriptServiceProvider,c8yViewsProvider, c8yComponentsProvider) {
		mapScriptServiceProvider.setKey('ec94a5c7fb1acf789b258c99ef83af38');
		function addActions(rou, loc, dev, act) {
			var l = {
				lat: 41.030122,
				lng: 117.300211
			};
			var i = rou.deviceId, //设备id
				s = "/device/" + i + "/位置", //为了添加页面之后立刻跳转
				c = dev.detailCached(i).then(function(n) { //查找设备是否有位置信息
					var e = n.data,
						a = "c8y_Position",
						t = "com_nsn_startups_vendme_fragments_GPSCoordinates",
						l = e[a] || e[t];
					return l
				})
			return c.then(function(n) {
				if(n == undefined) {
					act.addAction({
						priority: 1,
						text: '添加位置',
						showIfPermissions: {
							adminMOs: [i]
						},
						action: function() {
							dev.save({
								id: i,
								c8y_Position: _.cloneDeep(l) //设置一个默认位置
							}).then(function() {
								loc.path(s) //添加位置后立刻跳转到页面
							})
						}
					})
				} else {
					n
				}
			}), c
		}
		
		c8yViewsProvider.when('/device/:deviceId', {
			name: '位置',
			icon: "location-arrow",
			templateUrl: ':::PLUGIN_PATH:::/views/location.html',
			controller: 'location',
			showIf: ['$routeParams', '$location', 'c8yDevices', 'c8yActions', addActions]
		})
	}
}());