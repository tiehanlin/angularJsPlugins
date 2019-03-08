(function() {
	'use strict';

	angular
		.module('myapp.companyInfo')
		.controller('companyInfoController', companyInfoController);

	function companyInfoController($scope, c8yInventory, c8yUser, c8yRoles, c8ySettings, c8yPermissions, $uibModal) {
		$scope.show = false;
		$scope.web = false;
		c8yPermissions.hasAllRoles(['ROLE_APPLICATION_MANAGEMENT_ADMIN'], c8yUser.current())
			.then(function(result) {
				if(result == true) {
					$scope.show = true
				}
			});
		$scope.picSrc = '';
		c8ySettings.detailValue({
			category: 'com',
			key: 'com'
		}).then(function(value) {
			if(value !== false) {
				$scope.comInfo = value.comInfo;
				$scope.comBusiness = value.comBusiness;
				$scope.comProduct = value.comProduct;
				$scope.comIndustry = value.comIndustry;
				$scope.comWeb = value.comWeb;
			}
		});
		var picOption = {
			category: 'myPic',
			key: 'myPic'
		};
		c8ySettings.detailValue(picOption).then(function(value) {
			if(value !== false) {
				$('#tutu').css({
					'background-image': "url(" + value + ")"
				})
			}
		});
		$scope.changeWord = function() {
			$scope.web = false;
			var string = JSON.stringify({
				'comInfo': $scope.comInfo,
				'comBusiness': $scope.comBusiness,
				'comProduct': $scope.comProduct,
				'comIndustry': $scope.comIndustry,
				'comWeb': $scope.comWeb
			})
			c8ySettings.updateOption({
				category: 'com',
				key: 'com',
				value: string
			});
			var textareas = document.getElementsByTagName('textarea');
			for(var i = 0; i < textareas.length; i++) {
				textareas[i].readOnly = true;
			}
			$('#sureButton').hide();
			$('#changeButton').show();
		}
		$scope.changeView = function() {
			$('#changeButton').hide();
			$('#sureButton').show();
			$scope.web = true;
			var textareas = document.getElementsByTagName('textarea');
			for(var i = 0; i < textareas.length; i++) {
				textareas[i].readOnly = false;
			}
		}
		var $ctrl = this;
		$ctrl.animationsEnabled = true;
		$scope.changePic = function(size, parentSelector, id) {
			var parentElem = parentSelector ?
				angular.element($document[0].querySelector('.modal-demo ' + parentSelector)) : undefined;
			var modalInstance = $uibModal.open({
				animation: $ctrl.animationsEnabled,
				ariaLabelledBy: 'changePicTitle',
				ariaDescribedBy: 'changePicBody',
				templateUrl: 'changePic.html',
				controller: 'changePicCtrl',
				controllerAs: '$ctrl',
				size: size,
				appendTo: parentElem,
				resolve: {
					items: function() {
						return 1;
					}
				}
			});
		};
		$scope.text = 'companyInfo, world';
	};
	angular.module('myapp.companyInfo').controller('changePicCtrl', function($scope, c8ySettings, c8yBinary, $uibModalInstance, items) {
		var $ctrl = this;
		$ctrl.okok = function() {
			var fileInput = document.getElementById("file");
			var files = fileInput.files;
			var accept = {
				binary: ["image/png", "image/jpeg"],
				text: ["text/plain", "text/css", "application/xml", "text/html"]
			};
			var file;
			for(var i = 0; i < files.length; i++) {
				file = files[i];
				if(file !== null) {
					if(accept.binary.indexOf(file.type) > -1) {
						c8yBinary.upload(file).then(function(res) {
							var id = res.data.id;
							c8yBinary.detail(id - 0).then(function(res1) {
								c8yBinary.downloadAsDataUri(res1.data).then(
									function(val) {
										$('#tutu').css({
											'background-image': "url(" + val + ")"
										})
										c8ySettings.updateOption({
											category: 'myPic',
											key: 'myPic',
											value: val
										}).then($uibModalInstance.close())
									});
							});
						});
					} else if(accept.text.indexOf(file.type) > -1) {
						console.log('这是一个文本文件')
					} else {
						console.log('失败！')
					}
				}
			}

		};
		$ctrl.cancel = function() {
			$uibModalInstance.dismiss('cancel');
		};
	});
}());