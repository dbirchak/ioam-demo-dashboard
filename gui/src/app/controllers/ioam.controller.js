(function(app){

	var IoamAppCtrl = function($scope, $mdSidenav, $mdDialog, ApiService, SharedDataService, ErrorHandlerService,
							   ChartService, HelpersService) {

		// method prototypes
		$scope.init = init;
		$scope.updateSla = updateSla;
		$scope.openPanel = openPanel;
		$scope._readSettingsFromLocalStorage = _readSettingsFromLocalStorage;
		$scope._writeSettingsToLocalStorage = _writeSettingsToLocalStorage;

		// "scopify" shared data
		$scope.shared = SharedDataService.data;

		$scope.pathNames = [];
		$scope.shared.acceptedSettings = ["url", "startTime", "endTime", "targetDelay", "targetJitter"];

		// initialize the app
		$scope.init();

		/* Implementation */

		/**
		 * Initialize application
		 */
		function init(){

			// copy settings from cookies to Shared datastorage
			var localSettings = $scope._readSettingsFromLocalStorage();
			SharedDataService.data.apiSettings = {};
			angular.copy(localSettings, SharedDataService.data.apiSettings);

			$scope.updateSla();

		}

		/**
		 * Update SLA info
		 */
		function updateSla(){

			if(HelpersService.isTrueObject(SharedDataService.data.apiSettings)){
				if(HelpersService.hasOwnProperties(SharedDataService.data.apiSettings, SharedDataService.data.acceptedSettings)){
					$scope.pathNames = [];
					ApiService.getSla(SharedDataService.data.apiSettings, getSlaSuccessCbk, getSlaErrorCbk);
				}
			}
			else{
				return 1;
			}

			function getSlaSuccessCbk(data){

				if(Array.isArray(data)){

					data.forEach(function(pathData){

						$scope.pathNames.push(pathData.Path);

						window.setTimeout(function(){
							// create charts for current stats
							ChartService.createDonutChart([
								{
									"htmlId": "pathComplChart",
									"activePercentage": pathData["total-percent-packets-in-policy"]
								},
								{
									"htmlId": "delayComplChart",
									"activePercentage": pathData["total-percent-delay_out_of_compliance"]
								},
								{
									"htmlId": "jitterComplChart",
									"activePercentage": pathData["total-percent_jitter_out_of_compliance"]
								},
								{
									"htmlId": "pktLossChart",
									"activePercentage": pathData["total-percent-packets-received"]
								}
							], pathData.Path);

							// create charts for time-span stats
							ChartService.createBarChart([
								{
									"htmlId": "pathComplDevChart",
									"bars": [
										{
											"label": "Last 1 min",
											"value": pathData["1min-percent-packets-out-of-policy"]
										},
										{
											"label": "Last 15 min",
											"value": pathData["15min-percent-packets-out-of-policy"]
										},
										{
											"label": "Last 1 hr",
											"value": pathData["1hr-percent-packets-out-of-policy"]
										}
									]
								},
								{
									"htmlId": "delayComplDevChart",
									"bars": [
										{
											"label": "<1% deviation",
											"value": pathData["Delay_compliance_deviation_1"]
										},
										{
											"label": "1%-10% deviation",
											"value": pathData["Delay_compliance_deviation_10"]
										},
										{
											"label": ">10% deviation",
											"value": pathData["Delay_compliance_deviation_g10"]
										}
									]
								},
								{
									"htmlId": "jitterComplDevChart",
									"bars": [
										{
											"label": "<1% deviation",
											"value": pathData["jitter_compliance_deviation_1"]
										},
										{
											"label": "1%-10% deviation",
											"value": pathData["jitter_compliance_deviation_10"]
										},
										{
											"label": ">10% deviation",
											"value": pathData["jitter_compliance_deviation_g10"]
										}
									]
								},
								{
									"htmlId": "pktLossDevChart",
									"bars": [
										{
											"label": "Last 1 min",
											"value": pathData["1min-percent-packets-lost"]
										},
										{
											"label": "Last 15 min",
											"value": pathData["15min-percent-packets-lost"]
										},
										{
											"label": "Last 1 hr",
											"value": pathData["1hr-percent-packets-lost"]
										}
									]
								}
							], pathData.Path);
						}, 1000);



					});

				}

			}

			function getSlaErrorCbk(err){
				ErrorHandlerService.log(err);
			}

		}




		/**
		 * Open side panel by name
		 * @param panelName {String}
		 * @param [args] {Object} optional
		 */
		function openPanel(panelName, args) {

			args = args || null;

			console.log(panelName);

			// different actions for different panels
			switch (panelName) {

				case "settings":
					SharedDataService.data.sidePanel = true;
					SharedDataService.data.sidePanelName = panelName;
					break;
				default:
					SharedDataService.data.sidePanel = true;
					SharedDataService.data.sidePanelName = panelName;
					break;
			}

			$scope.$root.$broadcast("openPanel", {"panelName": panelName});

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

	IoamAppCtrl.$inject = ["$scope", "$mdSidenav", "$mdDialog", "ApiService", "SharedDataService", "ErrorHandlerService",
		"ChartService", "HelpersService"];
	app.controller("IoamAppCtrl", IoamAppCtrl);

})(app);