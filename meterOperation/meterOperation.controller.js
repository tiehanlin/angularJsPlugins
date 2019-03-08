(function() {
	'use strict';

	angular
		.module('meterOperation')
		.controller('meterOperationCtrl', ['$scope', '$routeParams', '$timeout', 'c8yDevices', 'c8yMeasurements', 'c8yDeviceControl', 'c8yAlert', '$uibModal', function($scope, $routeParams, $timeout, c8yDevices, c8yMeasurements, c8yDeviceControl, c8yAlert, $uibModal) {
			var deviceId = $routeParams.deviceId
			c8yDevices.detail(deviceId).then(function(res) {
				$scope.device = res.data;
			});
			$scope.measurements = []
			c8yMeasurements.list({
				'type': 'c8y_Acc',
				'source': deviceId,
				'revert': true,
				'pageSize':50
			}).then(function(measurements) {
				$scope.measurements = measurements
			});

			var filter = {
				device: deviceId,
				fragment: 'c8y_Acc',
				series: 'Acc'
			};
			var realtime = true;
			c8yMeasurements.latest(filter, realtime).then(function(latestMeasurement) {
				$scope.latestMeasurement = latestMeasurement
			});

			$scope.$watch('latestMeasurement', function(news) {
				if (news != undefined) {
					var newsClone=_.clone(news)
					$scope.measurements.unshift(newsClone)
					if($scope.measurements.length>50){
						$scope.measurements.splice(length-1,1)
					}
				}
			},true)



			$scope.switch = function(stauts) {
				var description, c8y_LoraCmd
				switch (stauts) {
					case 'open':
						description = '开阀'
						c8y_LoraCmd = {
							'text': '22 open'
						}
						break;
					case 'close':
						description = '关阀'
						c8y_LoraCmd = {
							'text': '22 close'
						}
						break;
				}
				var operation = {
					"deviceId": deviceId,
					"description": description,
					"c8y_LoraCmd": c8y_LoraCmd
				}
				c8yDeviceControl.save(operation).then(function(x) {
					var alert = {
						text: description + '成功',
						type: 'success'
					};
					c8yAlert.add(alert);
					$timeout(angular.bind({}, c8yAlert.remove, alert), 2000);
				})
			}
			$scope.reading = function(size, parentSelector) {
				var parentElem = undefined;
				var modalInstance = $uibModal.open({
					animation: true,
					ariaLabelledBy: 'readingTitle',
					ariaDescribedBy: 'readingBody',
					templateUrl: 'reading.html',
					controller: 'meterReadingCtrl',
					size: size,
					appendTo: parentElem
				})
				modalInstance.closed.then(function() {}, function() {}) //TODO
			}
		}])
		.controller('meterReadingCtrl', ['$scope', '$routeParams', '$uibModalInstance', 'c8yDeviceControl', 'c8yAlert', function($scope, $routeParams, $uibModalInstance, c8yDeviceControl, c8yAlert) {
			var category
			var deviceId = $routeParams.deviceId
			$scope.billingMethod = [{
				'text': '日结算',
				'value': 1
			}, {
				'text': '月结算',
				'value': 0
			}]
			$scope.category = function(classt) {
				category = classt;
			}
			$scope.ok = function(date) {
				var description, c8y_LoraCmd
				description = '读取结算记录'
				c8y_LoraCmd = {
					"text": '2a' + ' ' + category.value + ' ' + date
				}
				var operation = {
					"deviceId": deviceId,
					"description": description,
					"c8y_LoraCmd": c8y_LoraCmd
				}
				c8yDeviceControl.save(operation).then(function(x) {
					var alert = {
						text: description + '成功',
						type: 'success'
					};
					c8yAlert.add(alert);
					$uibModalInstance.close()
					$timeout(angular.bind({}, c8yAlert.remove, alert), 2000);
				})
			};
			$scope.cancel = function() {
				$uibModalInstance.dismiss('cancel');
			};
		}])
})()