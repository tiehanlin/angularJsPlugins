(function() {
	'use strict';

	angular
		.module('tracking')
		.controller('trackingCtrl', ['$scope', '$timeout', '$q', '$routeParams', 'c8yRealtime', 'c8yEvents', 'c8yDevices', 'c8yBase', 'c8yAlert',function($scope, $timeout, $q, $routeParams, c8yRealtime, c8yEvents, c8yDevices, c8yBase, c8yAlert) {
			$scope.defdate1 = moment().format('YYYY') + '-' + moment().format('MM') + '-' + moment().format('DD');
			$scope.dateOptions1 = {
				maxDate: moment().format('YYYY-MM-DD'),
				showWeeks: false
			};
			$scope.dt1 = new Date();
			$scope.dt2 = new Date();
			$scope.open1 = function() {
				$scope.popup1.opened = true;
			};
			$scope.popup1 = {
				opened: false
			};
			$scope.formats1 = ['yyyy-MM-dd'];
			$scope.defdate2 = moment().format('YYYY') + '-' + moment().format('MM') + '-' + moment().format('DD');
			$scope.dateOptions2 = {
				maxDate: moment().format('YYYY-MM-DD'),
				showWeeks: false
			};
			$scope.open2 = function() {
				$scope.popup2.opened = true;
			};
			$scope.popup2 = {
				opened: false
			};
			$scope.formats2 = ['yyyy-MM-dd'];
			$scope.jugeDate = function() {
				if ($scope.dt2 < $scope.dt1) {
					$scope.dt2 = undefined;
					c8yAlert.warning('结束时间应大于开始时间，请重新选择时间');
				};
			};
			var currentPage = 1,
				real = 0,
				sr = 0,
				timePolyline, automaps,
				deviceId = $routeParams.deviceId,
				eventsChannel = '/events/' + deviceId,
				scopeId = $scope.$id,
				click = [],
				lineArr = [],
				lineArrAmap = [],
				marks = [];
			$scope.customize = false;
			$scope.timeopt = ['最近一分钟', '最近一小时', '最近一天', '最近一周', '最近一个月', '自定义'];
			$scope.eves = [];
			$scope.markerOpts = [];
			$scope.polylineOpts = {};
			$scope.ban=false;

			function amapDevice(res) {
				var deferred = $q.defer();
				AMap.convertFrom([res.data.c8y_Position.lng, res.data.c8y_Position.lat], "gps", function(status, result) {
					deferred.resolve(result);
				});
				return deferred.promise;
			};

			function deviceLoca() {
				c8yDevices.detail(deviceId).then(function(res) {
					var img = 'bs';
					$q.all([amapDevice(res)]).then(function(data) {
						$scope.opts = {
							center: [data[0].locations[0].M, data[0].locations[0].O],
							zoom: 13
						}
						if($scope.markerOpts.length==0){
							createMarks(data[0].locations[0].M, data[0].locations[0].O, img, 1)
						}
					})
				});
			};

			function createMarks(lng, lat, img, time) {
				$scope.markerOpts.push({
					position: [lng, lat],
					icon: {
						image: 'https://webapi.amap.com/theme/v1.3/markers/n/mark_' + img + '.png'
					},
					time: time
				})
			};

			function pushLineArr(events) {
				angular.forEach(events, function(v) {
					lineArr.push([v.c8y_Position.lng, v.c8y_Position.lat]);
					$scope.eves.push({
						time: v.time
					})
				})
			}
			var amapLinshi = []

			function amapCoordinate(lineArr, ifpolyline, polyline) {
				var deferred = $q.defer();
				amapLinshi = []
				if (lineArr.length !== 0) {
					AMap.convertFrom(lineArr, "gps", function(status, result) {
						if (ifpolyline == true) {
							for (var i = 0; i < result.locations.length; i++) {
								amapLinshi.push([result.locations[i].M, result.locations[i].O])
								deferred.resolve(amapLinshi);
							}
						}
					})
				}
				return deferred.promise;
			}

			function createPolyline(lineArr, ifpolyline, polyline) {
				$q.all([amapCoordinate(lineArr, ifpolyline, polyline)]).then(function(data) {
					lineArrAmap = lineArrAmap.concat(data[0])
					for (var i = 0; i < $scope.eves.length; i++) {
						$scope.eves[i].position = lineArrAmap[i]
					}
					polyline.setOptions({
						path: angular.copy(lineArrAmap),
						strokeColor: "#3366FF",
						strokeOpacity: 1,
						strokeWeight: 5,
						strokeStyle: "solid",
						strokeDasharray: [10, 5],
						lineJoin: 'round'
					})
					$timeout(function() {
						automaps.setFitView()
					}, 0)
				})
			}

			function even(dt1, dt2, ifpolyline, polyline) {
				c8yEvents.list({
					source: deviceId,
					type: 'c8y_LocationUpdate',
					dateFrom: dt1,
					dateTo: dt2,
					pageSize: 1000,
					withTotalPages: true
				}).then(function(events) {
					$scope.eves = [];
					lineArr = [];
					lineArrAmap = [];
					pushLineArr(events)
					createPolyline(lineArr, ifpolyline, polyline)
					if (events.statistics.totalPages > 1) {
						$scope.moreList = true;
					} else {
						$scope.moreList = false;
					}
				});
			};

			function moreEven(dt1, dt2, ifpolyline, polyline) {
				$scope.ban=true;
				currentPage++;
				c8yEvents.list({
					source: deviceId,
					type: 'c8y_LocationUpdate',
					dateFrom: dt1,
					dateTo: dt2,
					pageSize: 1000,
					currentPage: currentPage,
					withTotalPages: true
				}).then(function(events) {
					lineArr = [];
					pushLineArr(events);
					createPolyline(lineArr, ifpolyline, polyline);
					if (currentPage == events.statistics.totalPages) {
						$scope.moreList = false;
					}
					$scope.ban=false;
				})
			};

			function switchs(change, dt1, dt2, fun, ifpolyline, polyline) {
				if (change !== '自定义') {
					$scope.customize = false;
					dt2 = moment().format(c8yBase.dateFullFormat);
					switch (change) {
						case '最近一分钟':
							dt1 = moment().subtract(1, 'minutes').format(c8yBase.dateFullFormat);
							break;
						case '最近一小时':
							dt1 = moment().subtract(1, 'hours').format(c8yBase.dateFullFormat);
							break;
						case '最近一天':
							dt1 = moment().subtract(1, 'days').hours(0).minutes(0).seconds(0).milliseconds(0).format(c8yBase.dateFullFormat);
							break;
						case '最近一周':
							dt1 = moment().subtract(7, 'days').hours(0).minutes(0).seconds(0).milliseconds(0).format(c8yBase.dateFullFormat);
							break;
						case '最近一个月':
							dt1 = moment().subtract(1, 'months').hours(0).minutes(0).seconds(0).milliseconds(0).format(c8yBase.dateFullFormat);
							break;
					}
					switch (fun) {
						case 'even':
							even(dt1, dt2, ifpolyline, polyline);
							break;
						case 'moreEven':
							moreEven(dt1, dt2, ifpolyline, polyline);
							break;
					}
				}
			}

			function allClear() {
				$('.trackcss').removeClass('lan');
				click = [];
				marks = [];
				$scope.markerOpts.splice(1, $scope.markerOpts.length - 1);
			}

			function startRealtime() {
				c8yRealtime.start(scopeId, eventsChannel);
			}

			function onDestroy() {
				c8yRealtime.stop(scopeId, eventsChannel);
			}

			function setUpListeners() {
				c8yRealtime.addListener(scopeId, eventsChannel, 'CREATE', onCreateEvent);
			}

			function realtimeAmap(eventObject) {
				var deferred = $q.defer();
				var eventLng = eventObject.c8y_Position.lng;
				var eventLat = eventObject.c8y_Position.lat;
				AMap.convertFrom([eventLng, eventLat], "gps", function(status, result) {
					deferred.resolve(result);
				})
				return deferred.promise;
			}

			function onCreateEvent(action, eventObject) {
				$q.all([realtimeAmap(eventObject)]).then(function(data) {
					var evenLngLat = [data[0].locations[0].M, data[0].locations[0].O];
					var newlnglat = {
						position: evenLngLat,
						icon: {
							image: 'https://webapi.amap.com/theme/v1.3/markers/n/mark_bs.png'
						},
						time: 1
					};
					$scope.markerOpts.splice($scope.markerOpts[0], 1, newlnglat);
					lineArrAmap.unshift(evenLngLat);
					timePolyline.setOptions({
						path: angular.copy(lineArrAmap),
						strokeColor: "#3366FF",
						strokeOpacity: 1,
						strokeWeight: 5,
						strokeStyle: "solid",
						strokeDasharray: [10, 5]
					})
					$timeout(function() {
						automaps.setFitView()
					}, 0)
				})
			}

			$scope.auto = function(maps) {
				automaps = maps;
				deviceLoca()
			}
			$scope.opts = {
				center: [116.40, 39.91],
				zoom: 13
			}
			$scope.setOptions = function(polyline) {
				timePolyline = polyline;
				var dt1, dt2;
				dt1 = moment().subtract(1, 'hours').format(c8yBase.dateFullFormat);
				dt2 = moment().format(c8yBase.dateFullFormat);
				even(dt1, dt2, true, polyline);
				$scope.time = function(change, dt1, dt2) {
					switch (change) {
						case '自定义':
							$scope.customize = true;
							break
					}
					var fun = 'even';
					currentPage = 1;
					switchs(change, dt1, dt2, fun, true, polyline)
					allClear()
				};
				$scope.search = function(change, dt1, dt2) {
					switch (change) {
						case '自定义':
							dt1 = moment(dt1).hours(0).minutes(0).seconds(0).milliseconds(0).format(c8yBase.dateFullFormat);
							dt2 = moment(dt2).endOf('day').format(c8yBase.dateFullFormat);
							even(dt1, dt2, true, polyline);
							break
					}
					var fun = 'even';
					currentPage = 1;
					switchs(change, dt1, dt2, fun, true, polyline)
					allClear()
				};
				$scope.more = function(change, dt1, dt2) {
					switch (change) {
						case '自定义':
							dt1 = moment(dt1).hours(0).minutes(0).seconds(0).milliseconds(0).format(c8yBase.dateFullFormat);
							dt2 = moment(dt2).endOf('day').format(c8yBase.dateFullFormat);
							moreEven(dt1, dt2, true, polyline);
							break
					}
					var fun = 'moreEven';
					switchs(change, dt1, dt2, fun, true, polyline)

				}
				setUpListeners();
				startRealtime();
			}

			$scope.markerToggle = function(data, $index) {
				var status = 'r'
				if (click.indexOf($index) !== -1) {
					$('.trackcss').eq($index).removeClass('lan');
					var i = marks[click.indexOf($index)];
					marks.splice(click.indexOf($index), 1);
					click.splice(click.indexOf($index), 1);
					$scope.markerOpts.splice(i, 1);
					for (var l = 0; l < marks.length; l++) {
						if (i < marks[l]) {
							marks[l] = marks[l] - 1;
						}
					}
				} else {
					$('.trackcss').eq($index).addClass('lan')
					var Lng = data.position[0],
						Lat = data.position[1];
					createMarks(Lng, Lat, status, data.time);
					click.push($index);
					marks.push($scope.markerOpts.length - 1);
				}
			}

			$scope.clearAll = function() {
				allClear()
			}

			$scope.showWindow = function(e, marker, map) {
				if (marker.G.icon.G.image == 'https://webapi.amap.com/theme/v1.3/markers/n/mark_bs.png') {
					c8yDevices.detail($routeParams.deviceId).then(function(res) {
						new AMap.InfoWindow({
								content: '设备名：<a href="#/device/' + res.data.id + '">' + res.data.name + '</a><br/>在该位置自从：' + moment(res.data.lastUpdated).format('YYYY-MM-DD HH:mm:ss'),
								offset: new AMap.Pixel(10, 0)
							})
							.open(map, marker.getPosition());
					})
				} else {
					new AMap.InfoWindow({
							content: moment(marker.G.time).format('YYYY-MM-DD HH:mm:ss'),
							offset: new AMap.Pixel(10, 0)
						})
						.open(map, marker.getPosition());
				}
			};
			$scope.toolBar = {
				locate: false
			}
			$scope.$on('$destroy', onDestroy);
		}])
}());