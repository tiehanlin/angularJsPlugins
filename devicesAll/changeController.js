(function() {
	'use strict';
	angular
		.module('myapp.devicesAll')
		.controller('changeController', function($uibModal, $log, $document, c8yPermissions, c8yUser) {
			var $ctrl = this;
			$ctrl.items = ['item1', 'item2', 'item3'];
			$ctrl.animationsEnabled = true;
			c8yPermissions.hasAllRoles(['ROLE_APPLICATION_MANAGEMENT_ADMIN'], c8yUser.current())
				.then(function(result) {
					if (result == true) {
						$('#uplogo').removeClass('cursor0')
						$ctrl.logos = function(size, parentSelector) {
							var parentElem = parentSelector ?
								angular.element($document[0].querySelector('.modal-demo ' + parentSelector)) : undefined;
							var modalInstance = $uibModal.open({
								animation: $ctrl.animationsEnabled,
								ariaLabelledBy: 'modal-title',
								ariaDescribedBy: 'modal-body',
								templateUrl: 'myModalContent.html',
								controller: 'changeLogo',
								controllerAs: '$ctrl',
								size: size,
								appendTo: parentElem,
								resolve: {
									items: function() {
										return $ctrl.items;
									}
								}
							});
						};
						$ctrl.openComponentModal = function() {
							var modalInstance = $uibModal.open({
								animation: $ctrl.animationsEnabled,
								component: 'modalComponent',
								resolve: {
									items: function() {
										return $ctrl.items;
									}
								}
							});

						};
						$ctrl.openMultipleModals = function() {
							$uibModal.open({
								animation: $ctrl.animationsEnabled,
								ariaLabelledBy: 'modal-title-bottom',
								ariaDescribedBy: 'modal-body-bottom',
								templateUrl: 'stackedModal.html',
								size: 'sm',
								controller: function($scope) {
									$scope.name = 'bottom';
								}
							});

							$uibModal.open({
								animation: $ctrl.animationsEnabled,
								ariaLabelledBy: 'modal-title-top',
								ariaDescribedBy: 'modal-body-top',
								templateUrl: 'stackedModal.html',
								size: 'sm',
								controller: function($scope) {
									$scope.name = 'top';
								}
							});
						};

						$ctrl.toggleAnimation = function() {
							$ctrl.animationsEnabled = !$ctrl.animationsEnabled;
						};
					}
				});
		});
}());