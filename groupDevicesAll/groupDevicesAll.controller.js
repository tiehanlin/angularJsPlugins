(function() {
	'use strict';

	angular
		.module('myapp.groupDevicesAll')
		.controller('groupDevicesAllCtrl', function($scope, $q, $timeout, $routeParams, c8yAlarms, c8yInventory, c8yGroups, c8yDevices, c8yPermissions, c8yUser) {
			var fontsize, itemSize, res, autoMaps, cluster, last, mapCenter, mapZoom,
				mars = [],
				tooltop = '-20',
				groupId = $routeParams.groupId,
				usability = {
					"UNAVAILABLE": [],
					"AVAILABLE": []
				};
			$scope.markerOpts = [];
			$scope.dev_con_adm = true;
			$scope.inv_adm = true;
			$scope.use_man_adm = true;
			$scope.deviceregistration = '#/deviceregistration';
			$scope.rules = '#/rules';
			$scope.users = '#/users';
			$scope.roles = '#/roles';

			function alarm(type) {
				var deferred = $q.defer();
				c8yInventory.detail(groupId).then(function(res) {
					var ids = _.map(res.data.childAssets.references, 'managedObject.id');
					var a = [];
					var sum = 0;
					for (var i = 0; i < ids.length; i++) {
						c8yAlarms.list({
							source: ids[i],
							severity: c8yAlarms.severity[type],
							status: c8yAlarms.status.ACTIVE,
							resolved: false,
							pageSize: 1,
							withTotalPages: true
						}).then(function(alarms) {
							a.push(alarms.statistics.totalPages)
							if (a.length == i) {
								for (var j = 0; j < a.length; j++) {
									sum += parseInt(a[j])
								}
								deferred.resolve(sum)
							}
						});
					}
				})
				return deferred.promise;
			}

			function deviceStatus(devices) {
				var status = [];
				for (var i = 0; i < devices.length; i++) {
					status[i] = c8yDevices.parseAvailability(devices[i]);
				}
				res = {};
				status.forEach(function(e) {
					res[e] = res[e] >= 1 ? res[e] + 1 : 1
				});
				if (res.AVAILABLE === undefined) {
					res.AVAILABLE = 0
				}
				if (res.UNAVAILABLE === undefined) {
					res.UNAVAILABLE = 0
				}
			}

			function echartsOpt() {
				$scope.lineOption = {
					toolbox: {
						left: 'center',
						right: 'center',
						top: tooltop,
						itemSize: itemSize,
						showTitle: false,
						feature: {
							restore: {
								show: true,
								icon: 'image://appinterface_groupDevicesAll/img/quanbushebei.png'
							}
						}
					},
					tooltip: {
						trigger: 'item',
						formatter: "{b}: {c}"
					},
					color: ['rgb(118,159,234)', 'rgb(61,206,223)'],
					legend: {
						orient: 'horizontal',
						selectedMode: false,
						bottom: 0,
						itemGap: 15,
						left: 'center',
						right: 'center',
						data: [{
							name: '离线设备',
							icon: 'circle',
							textStyle: {
								color: '#000',
								fontSize: fontsize
							}
						}, {
							name: '在线设备',
							icon: 'circle',
							textStyle: {
								color: '#000',
								fontSize: fontsize
							}
						}]
					},
					series: [{
						type: 'pie',
						radius: ['40%', '70%'],
						label: {
							normal: {
								show: false,
								position: 'outside',
								formatter: "{b}:{c}"
							}
						},
						hoverAnimation: false,
						labelLine: {
							normal: {
								show: false
							}
						},
						data: [{
							value: res.UNAVAILABLE,
							name: '离线设备'
						}, {
							value: res.AVAILABLE,
							name: '在线设备'
						}]
					}]
				};
			}

			function echartConfig() {
				$scope.lineConfig = {
					theme: 'default',
					event: [{
						click: onClick,
						restore: onRestore
					}],
					dataLoaded: true
				};
			}

			function createMarker(result, img, maps, v) {
				$scope.markerOpts.push({
					map: maps,
					position: [result.locations[0].M, result.locations[0].O],
					icon: {
						image: 'appinterface_groupDevicesAll/img/' + img + '.png',
						size: {
							width: 32,
							height: 32
						}
					},
					_id: v.id
				})
			}

			function amapCoordinate(devices, fettle) {
				var deferred = $q.defer(),
					statusLength = [];
				for (var i = 0; i < devices.length; i++) {
					(function(index) {
						if (devices[index].c8y_Position) {
							if (devices[index].c8y_Availability.status == fettle) {
								statusLength.push(devices[index]);
								AMap.convertFrom([devices[index].c8y_Position.lng, devices[index].c8y_Position.lat], "gps", function(status, result) {
									result.id = devices[index].id;
									usability[fettle].push(result);
									if (usability[fettle].length == statusLength.length) {
										deferred.resolve(usability[fettle]);
									}
								})
							}
						}
					})(i)
				}
				return deferred.promise;
			}

			function loadMarker(arr, status, img, maps) {
				$q.all([amapCoordinate(arr, status)])
					.then(function(data) {
						for (var i = 0; i < data[0].length; i++) {
							createMarker((data[0])[i], img, maps, (data[0])[i]);
						}
						$timeout(function() {
							maps.setFitView();
							mapCenter = maps.setFitView().getCenter();
							mapZoom = maps.getZoom();
						}, 0)
					})
			}

			function getMarker(devices, maps) {
				var devicesAvaAll = {
					"UNAVAILABLE": [],
					"AVAILABLE": []
				};
				for (var i = 0; i < devices.length; i++) {
					if (devices[i].c8y_Availability !== undefined) {
						switch (devices[i].c8y_Availability.status) {
							case "AVAILABLE":
								devicesAvaAll.AVAILABLE.push(devices[i])
								break;
							case "UNAVAILABLE":
								devicesAvaAll.UNAVAILABLE.push(devices[i])
								break;
						}
					}
				}
				if (devicesAvaAll.AVAILABLE.length !== 0) {
					loadMarker(devicesAvaAll.AVAILABLE, "AVAILABLE", "available", maps)
				}
				if (devicesAvaAll.UNAVAILABLE.length !== 0) {
					loadMarker(devicesAvaAll.UNAVAILABLE, "UNAVAILABLE", "unavailable", maps)
				}
			}

			function del(img) {
				$scope.$apply(function() {
					for (var i = 0; i < mars.length; i++) {
						if (mars[i].G.icon.G.image == "appinterface_groupDevicesAll/img/" + img + ".png") {
							mars[i].show()
							cluster.addMarker(mars[i])
						} else {
							mars[i].hide()
							cluster.removeMarker(mars[i])
						}
					}
				})
				autoMaps.setZoom(mapZoom)
				autoMaps.setCenter(mapCenter)
				autoMaps.clearInfoWindow();
			}

			function onClick(params) {
				if (last !== params.name && params.percent !== 100) {
					last = params.name;
					autoMaps.clearMap();
				}
				switch (params.name) {
					case '离线设备':
						del("unavailable")
						break;
					case '在线设备':
						del("available")
						break;
				}
			}

			function onRestore() {
				$scope.$apply(function() {
					for (var i = 0; i < mars.length; i++) {
						mars[i].show()
						cluster.addMarker(mars[i])
					}
				})
				last = undefined;
				autoMaps.setZoom(mapZoom)
				autoMaps.setCenter(mapCenter)
				autoMaps.clearInfoWindow();
			}

			function permissions(role, icon, who, how) {
				c8yPermissions.hasAnyRole(role, c8yUser.current())
					.then(function(result) {
						if (result == false) {
							$(icon).css('color', '#D0D0D0');
							$scope[who] = false;
							$scope[how] = null;
						}
					})
			}

			permissions(['ROLE_DEVICE_CONTROL_ADMIN', 'ROLE_DEVICE_CONTROL_READ'], '.icon-zhuceshebei', 'dev_con_adm', 'deviceregistration');
			permissions(['ROLE_INVENTORY_ADMIN', 'ROLE_INVENTORY_READ', 'ROLE_INVENTORY_CREATE'], '.icon-chuangjianbaojing', 'inv_adm', 'rules');
			permissions(['ROLE_USER_MANAGEMENT_READ', 'ROLE_USER_MANAGEMENT_ADMIN', 'ROLE_USER_MANAGEMENT_CREATE'], '.icon-yonghu', 'use_man_adm', 'users');
			permissions(['ROLE_USER_MANAGEMENT_ADMIN', 'ROLE_USER_MANAGEMENT_READ'], '.icon-jiaose', 'use_man_adm', 'roles');

			$scope.opts = {
				center: [116.40, 39.91],
				zoom: 4
			};
			switch (screen.height) {
				case 1080:
					fontsize = 18;
					itemSize = 90;
					break;
				case 1050:
					fontsize = 16;
					itemSize = 80;
					break;
				case 1024:
					fontsize = 14;
					itemSize = 70;
					break;
				case 900:
					fontsize = 14;
					itemSize = 70;
					break;
				case 800:
					fontsize = 12;
					itemSize = 70;
					tooltop = '-30';
					break;
				case 768:
					fontsize = 12;
					itemSize = 60;
					tooltop = '-24';
					break;
				case 720:
					fontsize = 12;
					itemSize = 60;
					tooltop = '-25';
					break;
				default:
					fontsize = 12;
					itemSize = 60;
					tooltop = '-24';
					break;
			}
			$q.all([alarm("CRITICAL"), alarm("MAJOR"), alarm("MINOR"), alarm("WARNING")]).then(function(data) {
				$scope.critical = data[0];
				$scope.major = data[1];
				$scope.newAlarms = data[0] + data[1] + data[2] + data[3];
			});
			$scope.auto = function(maps) {
				autoMaps = maps;
				c8yDevices.listChildren(groupId).then(function(devices) {
					deviceStatus(devices)
					echartsOpt()
					echartConfig()
					getMarker(devices, maps)
				})
			}
			$scope.mar = function(marker) {
				mars.push(marker)
				if (mars.length == $scope.markerOpts.length) {
					$timeout(function() {
						$scope.$apply(function() {
							cluster = new AMap.MarkerClusterer(autoMaps, mars);
						})
					}, 0)
				}
			}
			$scope.showWindow = function(e, marker, map) {
				c8yDevices.detail(marker.G._id).then(function(detail) {
					new AMap.InfoWindow({
							content: '设备名：<a href="#/device/' + detail.data.id + '">' + detail.data.name + '</a><br/>在该位置自从：' + moment(detail.data.lastUpdated).format('YYYY-MM-DD HH:mm:ss'),
							offset: new AMap.Pixel(10, 0)
						})
						.open(map, marker.getPosition());
					map.setCenter([detail.data.c8y_Position.lng, detail.data.c8y_Position.lat])
				})
			};
			$scope.toolBar = {
				locate: false
			}
		})
}());