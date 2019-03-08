(function() {
	'use strict';

	angular
		.module('myapp.location')
		.controller('location', ['$scope', '$routeParams', 'c8yDevices', 'c8yEvents', "c8yRealtime", "c8yMeasurements", 'c8yGeo', 'c8yAlert', function($scope, $routeParams, c8yDevices, c8yEvents, c8yRealtime, c8yMeasurements, c8yGeo, c8yAlert) {
			var deviceId = $routeParams.deviceId;
			$scope.opts = {
				center: [110.499981, 37.239226],
				zoom: 12
			};
			$scope.toolBar = {
				locate: false
			}
			$scope.makers = []
			$scope.location = {};
			$scope.centerMap = function() {
				$scope.opts = {
					center: [$scope.location.lng, $scope.location.lat],
					zoom: 12
				}
			}

			function zhuanhuan(x) {
				AMap.convertFrom(x, 'gps', function(status, result) {
					$scope.$apply(function() {
						$scope.location.lng = result.locations[0].M;
						$scope.location.lat = result.locations[0].O
						var obj = {
							position: [$scope.location.lng, $scope.location.lat],
							draggable: true
						}
						$scope.makers[0] = obj;

						$scope.opts = {
							center: [$scope.location.lng, $scope.location.lat],
							zoom: 15
						}
					});
				});
			}
			$scope.loadMarkers = function(marker) {
				var listener = marker.on('dragend', function(e) {
					$scope.$apply(function() {
						$scope.location.lng = e.lnglat.M;
						$scope.location.lat = e.lnglat.O;
					})

				});
			}
			$scope.load = function() {
				c8yDevices.detail(deviceId).then(function(result) {
					var lng = result.data.c8y_Position.lng;
					var lat = result.data.c8y_Position.lat;
					$scope.location.lng = lng
					$scope.location.lat = lat
					var obj = {
						position: [$scope.location.lng, $scope.location.lat],
						draggable: true
					}
					$scope.makers[0] = obj;
					$scope.opts = {
						center: [$scope.location.lng, $scope.location.lat],
						zoom: 15
					}
					//var lnglat = [lng, lat];
					//zhuanhuan(lnglat);
				});

			}
			c8yEvents.list({
				source: $routeParams.deviceId,
				type: 'c8y_LocationUpdate',
				pageSize: 1
			}).then(function(res) {
				//$scope.device = res[0];
				if(res.length == 0) {
					c8yDevices.detail(deviceId).then(function(result) {
						var lng = result.data.c8y_Position.lng;
						var lat = result.data.c8y_Position.lat;
						$scope.location.lng = lng
						$scope.location.lat = lat
						var obj = {
							position: [$scope.location.lng, $scope.location.lat],
							draggable: true
						}
						$scope.makers[0] = obj;
						$scope.opts = {
							center: [$scope.location.lng, $scope.location.lat],
							zoom: 15
						}
						//						var lnglat = [lng, lat]
						//						zhuanhuan(lnglat)
					})
				} else {
					var lng = res[0].c8y_Position.lng;
					var lat = res[0].c8y_Position.lat;
					$scope.location.lng = lng
					$scope.location.lat = lat
					var obj = {
						position: [$scope.location.lng, $scope.location.lat],
						draggable: true
					}
					$scope.makers[0] = obj;
					$scope.opts = {
						center: [$scope.location.lng, $scope.location.lat],
						zoom: 15
					}
					//					var lnglat = [lng, lat]
					//					zhuanhuan(lnglat)
				}
			});
			$scope.save = function() {
				c8yDevices.detail(deviceId).then(function(res) {
					var device = res.data;
					if(device.c8y_Position == undefined) {
						device.c8y_Position = {}
					}
					device.c8y_Position.lng = $scope.location.lng;
					device.c8y_Position.lat = $scope.location.lat;
					device.c8y_Position.alt = $scope.location.alt;
					return device;
				}).then(c8yDevices.update);
				var obj = {
					position: [$scope.location.lng, $scope.location.lat],
					draggable: true
				}
				$scope.opts = {
					center: [$scope.location.lng, $scope.location.lat],
					zoom: 12
				}
				$scope.makers[0] = obj
			}
			$scope.search = function() {
				/*c8yGeo.geoCode($scope.location.address).then(function(res) {
					if(res.data.length > 0) {
						var position = res.data[0];
						var lng = position.lon;
						var lat = position.lat;
						var lnglat = [lng, lat]
						zhuanhuan(lnglat)
					}
				});*/
				AMap.service('AMap.PlaceSearch', function() {
					var placeSearch = new AMap.PlaceSearch({ //构造地点查询类
						pageSize: 5,
						pageIndex: 1,
						city: "010"
					});
					placeSearch.search($scope.location.address, function(status, result) {
						console.log(result)
						if(result.poiList==undefined){
							alert('您输入的信息无法准确定位，请重新输入')
							return
						}
						if(result.poiList.pois.length > 0) {
							$scope.$apply(function() {
								var position = result.poiList.pois[0];
								var lng = position.location.M;
								var lat = position.location.O;
								$scope.location.lng = lng
								$scope.location.lat = lat;
								var obj = {
									position: [$scope.location.lng, $scope.location.lat],
									draggable: true
								}
								$scope.makers[0] = obj;
								$scope.opts = {
									center: [$scope.location.lng, $scope.location.lat],
									zoom: 15
								}
							})
						}
						
					});

				})
			}
			var eventsChannel = '/events/' + deviceId;
			var scopeId = $scope.$id;

			function startRealtime() {
				c8yRealtime.start(scopeId, eventsChannel);
			}

			function setUpListeners() {
				c8yRealtime.addListener(scopeId, eventsChannel, 'CREATE', onCreateEvent);
			}

			function stopRealtime() {
				if(sr == 1) {
					c8yRealtime.stop(scopeId, eventsChannel);
				}
			}

			function onCreateEvent(action, eventObject) {
				var lng = eventObject.c8y_Position.lng;
				var lat = eventObject.c8y_Position.lat;
				var lnglat = [lng, lat];
				$scope.location.alt = eventObject.c8y_Position.alt;
				zhuanhuan(lnglat)
			}
			$scope.$on('$destroy', stopRealtime);
			var real = 0,
				sr = 0;
			$scope.realTime = function() {
				real++;
				if(real == 1) {
					setUpListeners();
					startRealtime();
					sr = 1;
					$('#realTime').removeClass('inactive')
				}
				if(real == 2) {
					stopRealtime();
					real = 0;
					sr = 0;
					$('#realTime').addClass('inactive')
				}
			}
			$scope.text = 'location';
		}])
}());