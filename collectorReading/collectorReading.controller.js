(function() {
	"use strict";

	angular
		.module("myapp.collectorReading")
		.controller("collectorReadingCtrl", [
			"$scope",
			"$routeParams",
			"c8yDeviceControl",
			"c8yInventory",
			"c8yRealtime",
			"$uibModal",
			"$log",
			"c8yAlert",
			collectorReadingCtrl
		])
		.controller('CollectorModalInstanceCtrl', [
			'$scope',
			'$routeParams',
			'$uibModalInstance',
			'c8yAlert',
			'c8yIdentity',
			'c8yAudits',
			// 'items',
			'c8yInventory',
			CollectorModalInstanceCtrl
		]);

		function collectorReadingCtrl (
			$scope,
			$routeParams,
			c8yDeviceControl,
			c8yInventory,
			c8yRealtime,
			$uibModal,
			$log,
			c8yAlert
		) {
			var vm=this;
			vm.deviceId = $routeParams.deviceId;
			vm.deviceFilter = "";
			vm.operationStatus = {};
			vm.scopeId = $scope.$id;
			vm.channel = '/operations/*';
			vm.statusText = {"SUCCESSFUL":"check-circle","FAILED":"exclamation-circle","PENDING":"clock-o","EXECUTING":"refresh fa-spin"}
			vm.modal = {};

			c8yInventory.childDevices(vm.deviceId).then(function(res){
				console.log(res);
				vm.devices = res
			})
			c8yRealtime.addListener(vm.scopeId, vm.channel, c8yRealtime.realtimeActions().UPDATE, onRealtimeNotification);
  		c8yRealtime.start(vm.scopeId, vm.channel);

			$scope.$on("$destroy", function() {
				c8yRealtime.stop(vm.scopeId, vm.channel);
      })

			//some function
			vm.createUrl=function(id){
				return ['#device/',id,'/表具'].join("")
			}
			vm.getAll=function getAll(){
				vm.devices.forEach(function(v,i){
					vm.creatCommand(v.id,i)
				})
			}
			vm.creatCommand=function creatCommand(id,index) {
				var operation = {
					deviceId: id,
					description: "群抄"+id,
					c8y_QJCommand: {
						'text': 'collect all data'
					},
					c8y_OperationStatus:0
				}
				c8yDeviceControl.create(operation).then(function(res) {
					vm.operationStatus[id]="EXECUTING"
					c8yAlert.success('命令已发送成功');
				});
			}
			vm.getInfo=function getInfo(id){
				var operation = {
					deviceId:id,
					description:"下载"+id+"的表具信息",
					c8y_QJCommand:{
						'text':'download dinfo'
					},
					c8y_OperationStatus:0
				}
				c8yDeviceControl.create(operation).then(function(res) {
					vm.operationStatus[id]="EXECUTING"
					c8yAlert.success('命令已发送成功');
				});
			}
			vm.statusFormat = function(item){
				return vm.statusText[vm.operationStatus[item.id]||["PENDING","EXECUTING","SUCCESSFUL","FAILED"][item.c8y_OperationStatus]||"PENDING"]
			}
			//modal functions
			vm.modal.open = function(size) {
          var parentElem = undefined;
          var modalInstance = $uibModal.open({
              animation: true,
              ariaLabelledBy: 'modal-title',
              ariaDescribedBy: 'modal-body',
              templateUrl: 'collectorModalContent.html',
              controller: 'CollectorModalInstanceCtrl',
              controllerAs: 'vm',
              size: size,
              appendTo: parentElem,
              resolve: {
                  items: function() {
                      return vm.modal.alarms;
                  }
              }
          });
          //关闭模态框回调函数
          modalInstance.result.then(function(selectedItem) {
						c8yInventory.childDevices(vm.deviceId).then(function(res){
							console.log(res);
							vm.devices = res
						})
							console.log("刷新列表");

          }, function() {
              //失败回调
							console.log("关闭模态框失败");
          });
      };

      // modal end

			// 判断是否操作完成
			function isOperationCompleted(operation) {
				console.log("结果检查中...");
		    return (operation.status === c8yDeviceControl.status.SUCCESSFUL
		      || operation.status === c8yDeviceControl.status.FAILED
					|| operation.status === c8yDeviceControl.status.PENDING
					|| operation.status === c8yDeviceControl.status.EXECUTING
				);
		  }
			// 操作状态更新回调
			function onRealtimeNotification(evt, data) {
				console.log("操作状态已更新，检查结果...");
		    if (isOperationCompleted(data)) {
					console.log(data);
					vm.operationStatus[data.deviceId]=data.status
					if(data.status=="SUCCESSFUL"){
						//TODO:获取对应设备的信息
						c8yInventory.detail(data.deviceId).then(function(res){
							for(var i =0;i<vm.devices.length;i++){
								if(vm.devices[i].id==res.data.id){
									vm.devices[i]=res.data;
									break;
								}
							}
						})
					}
		    }
		  };
		}

    function CollectorModalInstanceCtrl($scope,$routeParams,$uibModalInstance, c8yAlert, c8yIdentity, c8yAudits, c8yInventory) {
			var vm = this;
			vm.collectorData={};
			vm.ok = function(){
				c8yInventory.create(angular.extend({
					type:"c8y_Collector"
				},vm.collectorData)).then(function(res){
					//加为子设备
					c8yInventory.addChildDevice($routeParams.deviceId,{id:res.data.id,name:res.data.name}).then(function(res){
						$uibModalInstance.close()
						c8yAlert("添加成功")
					},function(res){
						console.log(res);
					})
					//添加身份标志
					c8yIdentity.createIdentity(res.data.id,{type:"c8y_Serial",externalId:vm.collectorIdentity}).then(function(res){
						console.log(res);
					})
				})
			}
			vm.cancel = function(){
				$uibModalInstance.close()
			}
    };
})();
