(function() {
	'use strict';
	angular
		.module('myapp.devicesAll')
		.controller('changeLogo', function($uibModalInstance, items, c8yInventory, c8yBinary, c8ySettings) {
			var $ctrl = this;
			$ctrl.items = items;
			$ctrl.selected = {
				item: $ctrl.items[0]
			};
			$ctrl.file = function() {
				$uibModalInstance.close($ctrl.selected.item);
				var fileInput = document.getElementById("file");
				var files = fileInput.files;
				var accept = {
					binary: ["image/png", "image/jpeg"],
					text: ["text/plain", "text/css", "application/xml", "text/html"]
				};
				var file;
				for (var i = 0; i < files.length; i++) {
					file = files[i];
					if (file !== null) {
						if (accept.binary.indexOf(file.type) > -1) {
							c8yBinary.upload(file).then(function(res) {
								$ctrl.id = res.data.id;
								c8yBinary.detail($ctrl.id - 0).then(function(res1) {
									c8yBinary.downloadAsDataUri(res1.data).then(
										function(val) {
											var c = val;
											var a = document.createElement('style')
											a.innerHTML = '#app .navigator .title{background-image:url(' + c + ')}';
											var body = document.getElementsByTagName('body').item(0);
											body.appendChild(a);
											c8ySettings.updateOption({
												category: 'mylogo',
												key: 'mylogo',
												value: c
											});
										});
								});
							});
						} else if (accept.text.indexOf(file.type) > -1) {
							console.log('这是一个文本文件')
						} else {
							console.log('失败！')
						}
					}
				}
			}
			$ctrl.cancel = function() {
				$uibModalInstance.dismiss('cancel');
			};
		});
}())