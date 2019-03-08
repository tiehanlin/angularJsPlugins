(function() {
	"use strict";

	angular
		.module("myapp.meterReadingSingle")
		.controller("meterReadingSingle", ["$scope", "$routeParams", "c8yDevices", "c8yDeviceControl", "c8yDeviceGroup", "c8yAlert", function($scope, $routeParams, c8yDevices, c8yDeviceControl, c8yDeviceGroup, c8yAlert) {
			$scope.deviceId = $routeParams.deviceId;
			c8yDevices.detail($scope.deviceId).then(function(res) {
						$scope.name=res.data.name
					});
			$scope.submit = function() {
				var operation = {
					deviceId: $scope.deviceId ,
					//description: $scope.commandTitle,
					c8y_QJCommand: {
						'text': 'collect single data'
					}
				};
				c8yDeviceControl.create(operation).then(function(res) {
					c8yAlert.success('设备命令已发送成功');
				});
			}
		}])
})();