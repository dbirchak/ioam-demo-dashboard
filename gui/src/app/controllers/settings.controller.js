(function(app){

	var SettingsCtrl = function($scope, $mdSidenav, Restangular, SharedDataService, HelpersService) {

		$scope.saveSettings = saveSettings;
		$scope.fillOutForm = fillOutForm;

		// "scopify" shared data
		$scope.shared = SharedDataService.data;

		$scope.sFormData = {};
		$scope.$on("openPanel", function(event, args){
			if(args.panelName === "settings"){
				$scope.fillOutForm();
			}
		});


		/* Implementation */

		/**
		 * Saves typed-in form settings data and applies it to the Restangular
		 */
		function saveSettings(){
			$scope._writeSettingsToLocalStorage($scope.sFormData);
			SharedDataService.data.apiSettings = $scope.sFormData;
			$scope.updateSla();
		}

		/**
		 * Fill out the Settings form from SharedDataService
		 */
		function fillOutForm(){

			var s, localSettings;

			SharedDataService.data.apiSettings = {};

			localSettings = $scope._readSettingsFromLocalStorage();
			angular.copy(localSettings, SharedDataService.data.apiSettings);
			s = SharedDataService.data.apiSettings;

			if(HelpersService.isTrueObject(s)){

				// copy Shared settings to the form
				$scope.shared.acceptedSettings.forEach(function(item){

					$scope.sFormData[item] = (s.hasOwnProperty(item)) ? s[item] : ""
				});

			}
		}

		function _readSettingsFromLocalStorage(){
			var serializedJson, unserializedJson;
			serializedJson = window.localStorage.getItem("ioamDashboardSettings");

			try {
				unserializedJson = JSON.parse(serializedJson);
			}
			catch(e){
				return {};
			}
			return unserializedJson;
		}

		function _writeSettingsToLocalStorage(settings){
			var serializedJson = JSON.stringify(settings);
			window.localStorage.setItem("ioamDashboardSettings", serializedJson);
		}



	};

	SettingsCtrl.$inject = ["$scope", "$mdSidenav", "Restangular", "SharedDataService", "HelpersService"];
	app.controller("SettingsCtrl", SettingsCtrl);

})(app);