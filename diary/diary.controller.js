(function() {
	'use strict';

	angular
		.module('myapp.diary')
		.controller('diaryController', diaryController)
		.controller('editDiaryCtrl', editDiaryCtrl)
		.controller('modelDiaryCtrl', modelDiaryCtrl);

	/* @ngInject */
	function diaryController($scope, c8yBase, c8yAlarms, c8yAudits, c8yAlert, $uibModal) {
		$scope.defdate1 = moment().format('YYYY') + '-' + moment().format('MM') + '-' + moment().format('DD')
		$scope.dateOptions1 = {
			maxDate: moment().format('YYYY-MM-DD'),
			showWeeks: false
		};
		$scope.open1 = function() {
			$scope.popup1.opened = true;
		};
		$scope.popup1 = {
			opened: false
		};
		$scope.formats1 = ['yyyy-MM-dd'];
		$scope.defdate2 = moment().format('YYYY') + '-' + moment().format('MM') + '-' + moment().format('DD')
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
		var dt1 = new Date();
		dt1.setDate(dt1.getDate() - dt1.getDate() + 1);
		$scope.dt1 = dt1
		$scope.dt2 = new Date()
		$scope.jugeDate = function() {
			if($scope.dt2 < $scope.dt1) {
				$scope.dt2 = undefined;
				c8yAlert.warning('结束时间应大于开始时间，请重新选择时间');
			}
		}
		//上面是日期选择
		$scope.diary = []
		var currentPage = 1;

		function list(dateStart, dateEnd) {
			dateStart = moment(dateStart).subtract(1, 'days').format('YYYY-MM-DDT16:00:00.000Z')
			dateEnd = moment(dateEnd).format('YYYY-MM-DDT16:00:00.000Z')
			c8yAudits.list({
				revert: true, //根据时间倒序显示
				type: 'diary',
				dateFrom: dateStart,
				dateTo: dateEnd,
				pageSize: 10,
				currentPage: currentPage
			}).then(function(audits) {
				console.log(audits)
				if(audits.length == 10) {
					$scope.tenData = true
				} else {
					$scope.tenData = false
				}
				for(var i = 0; i < audits.length; i++) {
					$scope.diary.push(audits[i])
				}

			});
		}
		list($scope.dt1, $scope.dt2);
		$scope.search = function() {
			c8yAudits.list({
				revert: true, //根据时间倒序显示
				type: 'diary',
				dateFrom: $scope.dt1,
				dateTo: $scope.dt2,
				pageSize: 10,
				currentPage: 1
			}).then(function(audits) {
				if(audits.length == 10) {
					$scope.tenData = true
				} else {
					$scope.tenData = false
				}
				console.log(audits)
				$scope.diary = audits;
				currentPage = 1;
			});
		}

		$scope.more = function() {
			currentPage++
			list($scope.dt1, $scope.dt2);

		}
		//下面是模态框的配置
		var $ctrl = this;
		$ctrl.animationsEnabled = true;
		$scope.edit = function(size, parentSelector, id) {
			//前2个参数必需，其余的参数看你需要来传值
			var parentElem = parentSelector ?
				angular.element($document[0].querySelector('.modal-demo ' + parentSelector)) : undefined;
			var modalInstance = $uibModal.open({
				animation: $ctrl.animationsEnabled,
				ariaLabelledBy: 'editDiaryTitle',
				ariaDescribedBy: 'editDiaryBody',
				templateUrl: 'editDiary.html',
				controller: 'editDiaryCtrl',
				controllerAs: '$ctrl',
				size: size,
				appendTo: parentElem,
				resolve: {
					items: function() {
						return 1; //return的东西在模态框的Controller里item可以用
					}
				}
			});
			modalInstance.closed.then(function() {
				c8yAudits.list({
					revert: true, //根据时间倒序显示
					type: 'diary',
					dateFrom: $scope.dt1,
					dateTo: $scope.dt2,
					pageSize: 10,
					currentPage: 1
				}).then(function(audits) {
					console.log(audits.length)
					if(audits.length == 10) {
						$scope.tenData = true
					} else {
						$scope.tenData = false
					}
					$scope.diary = audits;
					currentPage = 1;
				});
			}, function() {});
		};
		$scope.model = function(size, parentSelector, id) {
			//前2个参数必需，其余的参数看你需要来传值
			var parentElem = parentSelector ?
				angular.element($document[0].querySelector('.modal-demo ' + parentSelector)) : undefined;
			var modalInstance = $uibModal.open({
				animation: $ctrl.animationsEnabled,
				ariaLabelledBy: 'modelDiaryTitle',
				ariaDescribedBy: 'modelDiaryBody',
				templateUrl: 'modelDiary.html',
				controller: 'modelDiaryCtrl',
				controllerAs: '$ctrl',
				size: size,
				appendTo: parentElem,
				resolve: {
					items: function() {
						return id; //return的东西在模态框的Controller里item可以用
					}
				}
			});
			modalInstance.closed.then(function() {
				c8yAudits.list({
					revert: true, //根据时间倒序显示
					type: 'diary',
					dateFrom: $scope.dt1,
					dateTo: $scope.dt2,
					pageSize: 10,
					currentPage: 1
				}).then(function(audits) {
					if(audits.length == 10) {
						$scope.tenData = true
					} else {
						$scope.tenData = false
					}
					$scope.diary = audits;
					currentPage = 1;
				});
			}, function() {});
		};
	};

	function editDiaryCtrl($scope, $uibModalInstance, items, c8yAudits, c8yBase, c8yDevices) {
		$scope.defdate1 = moment().format('YYYY') + '-' + moment().format('MM') + '-' + moment().format('DD')
		$scope.dateOptions1 = {
			maxDate: moment().format('YYYY-MM-DD'),
			showWeeks: false
		};
		$scope.open1 = function() {
			$scope.popup1.opened = true;
		};
		$scope.popup1 = {
			opened: false
		};
		$scope.formats1 = ['yyyy-MM-dd'];
		$scope.dt1 = new Date();
		$scope.dt1 = moment($scope.dt1).format('YYYY-MM-DDT08:00:00.000Z')
		//↑会报Cannot read property 'length' of undefined的错误，原因未知
		$scope.dt2 = new Date();
		$scope.dt2 = moment($scope.dt2).format('YYYY-MM-DDT23:59:59.000Z')
		c8yAudits.list({
			revert: true, //根据时间倒序显示
			type: 'model',
			dateFrom: '2017-01-01T02:25:47.979Z',
			dateTo: $scope.dt2,
			pageSize: 10,
			currentPage: 1
		}).then(function(audits) {
			$scope.audits = audits
		});
		c8yDevices.list().then(function(devices) {
			$scope.devices = devices;

		});
		$scope.chuan = function(name) {
			$scope.selectValue = name
		}
		$scope.fill = function(text) {
			$scope.text = text
		}
		$scope.save = function() {
			c8yAudits.create({
				activity: "diary creat",
				type: 'diary',
				people: $scope.people,
				time: $scope.dt1,
				text: $scope.text,
				device:$scope.selectValue
			}).then($uibModalInstance.close());

		};
		$scope.cancel = function() {
			$uibModalInstance.dismiss('cancel');
		};
	}

	function modelDiaryCtrl($scope, $uibModalInstance, items, c8yAudits, c8yBase) {
		$scope.save = function() {
			c8yAudits.create({
				activity: "model creat",
				type: 'model',
				title: $scope.title,
				time: moment().format(c8yBase.dateFormat),
				text: $scope.text
			}).then($uibModalInstance.close());

		};
		$scope.cancel = function() {
			$uibModalInstance.dismiss('cancel');
		};
	}
}());