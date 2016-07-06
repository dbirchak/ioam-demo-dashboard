(function(app){

	var IoamAppCtrl = function($scope, $mdSidenav, $mdDialog, ApiService, SharedDataService, ErrorHandlerService, ChartService) {

		// method prototypes
		$scope.init = init;
		$scope.updateSla = updateSla;

		// "scopify" shared data
		$scope.shared = SharedDataService.data;

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

				ChartService.createDonutChart([
					{
						"htmlId": "pathComplChart",
						"activePercentage": "80"
					},
					{
						"htmlId": "delayComplChart",
						"activePercentage": "100"
					},
					{
						"htmlId": "jitterComplChart",
						"activePercentage": "20"
					},
					{
						"htmlId": "pktLossChart",
						"activePercentage": "99"
					}
				]);




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