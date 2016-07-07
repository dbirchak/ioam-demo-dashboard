(function(app){

	var IoamAppCtrl = function($scope, $mdSidenav, $mdDialog, ApiService, SharedDataService, ErrorHandlerService, ChartService) {

		// method prototypes
		$scope.init = init;
		$scope.updateSla = updateSla;

		// "scopify" shared data
		$scope.shared = SharedDataService.data;

		$scope.pathNames = [];

		// initialize the app
		$scope.init();

		/* Implementation */

		/**
		 * Initialize application
		 */
		function init(){

			$scope.updateSla();

		}

		/**
		 *
		 */
		function updateSla(){

			var restCallConfig = {
				"StartTime": 1123123123,
				"EndTime": 1123123323,
				"target-delay": 123,
				"target-jitter": 1
			};

			ApiService.getSla(restCallConfig, getSlaSuccessCbk, getSlaErrorCbk);

			function getSlaSuccessCbk(data){

				if(Array.isArray(data)){

					data.forEach(function(pathData){

						$scope.pathNames.push(pathData.Path);

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
								"htmlId": "jitterComplChart",
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
								"htmlId": "pktLossChart",
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



					});

				}

			}

			function getSlaErrorCbk(err){
				ErrorHandlerService.log(err);
			}

		}





	};

	IoamAppCtrl.$inject = ["$scope", "$mdSidenav", "$mdDialog", "ApiService", "SharedDataService", "ErrorHandlerService",
		"ChartService"];
	app.controller("IoamAppCtrl", IoamAppCtrl);

})(app);