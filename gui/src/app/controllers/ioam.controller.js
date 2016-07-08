(function(app){

	var IoamAppCtrl = function($scope, $mdSidenav, $mdDialog, ApiService, SharedDataService, ErrorHandlerService,
							   ChartService, HelpersService, $interval) {

		// method prototypes
		$scope.init = init;
		$scope.updateSla = updateSla;
		$scope.openPanel = openPanel;
		$scope._readSettingsFromLocalStorage = _readSettingsFromLocalStorage;
		$scope._writeSettingsToLocalStorage = _writeSettingsToLocalStorage;

		// "scopify" shared data
		$scope.shared = SharedDataService.data;

		$scope.oldPathNames = {};
		$scope.pathNames = {};
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
			$interval(function(){
				$scope.updateSla();
			}, 2000);

		}

		/**
		 * Update SLA info
		 */
		function updateSla(){

			if(HelpersService.isTrueObject(SharedDataService.data.apiSettings)){
				if(HelpersService.hasOwnProperties(SharedDataService.data.apiSettings, SharedDataService.data.acceptedSettings)){
					angular.copy($scope.pathNames);
					ApiService.getSla(SharedDataService.data.apiSettings, getSlaSuccessCbk, getSlaErrorCbk);
				}
			}
			else{
				return 1;
			}

			function getSlaSuccessCbk(data){

				if(Array.isArray(data)){

					var dataArrayIndex;

					// if empty input array received
					if(data.length === 0){
						$scope.pathNames = [];
					}

					// if input array contains 1+ items
					else{

						// *** process new and updated values

						var pathDataProp, untouched = [];

						// array of untouched path names
						for(pathDataProp in $scope.pathNames){
							if($scope.pathNames.hasOwnProperty(pathDataProp)) {
								untouched.push(pathDataProp);
							}
						}

						// iterate them all
						for(dataArrayIndex = 0; dataArrayIndex < data.length; dataArrayIndex++){

							var untouchedIndex;

							// if path name exists
							if($scope.pathNames.hasOwnProperty(data[dataArrayIndex].Path)){
								console.log("mark to update path info", data[dataArrayIndex].Path);
								$scope.pathNames[data[dataArrayIndex].Path].status = "update";

								untouchedIndex = untouched.indexOf(data[dataArrayIndex].Path);
								if(untouchedIndex > -1)
									untouched.splice(untouchedIndex, 1);

							}
							// if doesn't
							else{

								console.log("add new path name", data[dataArrayIndex].Path);
								$scope.pathNames[data[dataArrayIndex].Path] = {
									"name": data[dataArrayIndex].Path,
									"status": "new"
								};


							}

						}

						untouched.forEach(function(untouchedPathName){
							console.log("delete untouched path name", untouchedPathName);
							delete $scope.pathNames[untouchedPathName];
						});


						// *** draw charts

						window.setTimeout(function(){
							data.forEach(function(pathData){

								var pathName = pathData.Path;
								var pathStatusData = $scope.pathNames[pathName];

								switch(pathStatusData.status){
									case "new":
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
										], pathName);

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
										], pathName);
										break;
									case "update":



										break;
								}


							});

						}, 300);





					}

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
		"ChartService", "HelpersService", "$interval"];
	app.controller("IoamAppCtrl", IoamAppCtrl);

})(app);