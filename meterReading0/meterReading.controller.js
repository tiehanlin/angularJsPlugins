(function() {
	"use strict";

	angular
		.module("myapp.meterReading")
		.controller("meterReading", ["$scope", "$routeParams", "c8yDevices", "c8yDeviceControl", "c8yAlert", function($scope, $routeParams, c8yDevices, c8yDeviceControl, c8yAlert) {
			var deviceId = $routeParams.deviceId;
			var allDeviceId=[];
			c8yDevices.detail(deviceId).then(function(res) {
				var count=0;
				var childDevicesArr = res.data.childDevices.references;
				var showDevice=[];
				for(var i = 0; i < childDevicesArr.length; i++) {
					c8yDevices.detail(childDevicesArr[i].managedObject.id).then(function(res) {
						if(res.data.type == "c8y_Collector") //定义集中器类型,按照不同类型做不同tab，这里做区分
						{
							showDevice.push({
								name: res.data.name,
								id: res.data.id,
							})
							allDeviceId.push(parseInt(res.data.id))
							//可能需要转数字
						}
						count++;
						if(count == i) {
							$scope.allDevice = showDevice
						}
					});
				}
			});
			$scope.submit = function() {
				if($scope.checked.length == 0) {
					console.log(1)
				} else {
					var onlyNumber = _.compact($scope.checked)
					//除去所有false值的
					if(onlyNumber.length != 0) {
						for(var i = 0; i < onlyNumber.length; i++) {
							creatCommand(onlyNumber[i]);
						}
					} else {
						c8yAlert.danger('不好意思您没有选择设备');
					}
				}

			}
			$scope.clickAll = function() {
				//最终id
				if($scope.allCheck == true) {
					$scope.checked = angular.copy(allDeviceId);
				} else {
					$scope.checked = []
				}

			}

			function creatCommand(id) {
				id = String(id) //转字符串
				var operation = {
					deviceId: id,
					//description: $scope.commandTitle,
					c8y_QJCommand: {
						'text': 'collect all data'
					}
				}
				c8yDeviceControl.create(operation).then(function(res) {
					c8yAlert.success('命令已发送成功');
				});
			}
		}])
})();