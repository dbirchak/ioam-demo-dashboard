(function(app){

	var IoamAppCtrl = function($scope, $mdSidenav, $mdDialog, ApiService, SharedDataService, ErrorHandlerService) {

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

			var config = {
				"StartTime": 1123123123,
				"EndTime": 1123123323,
				"target-delay": 123,
				"target-jitter": 1
			};

			ApiService.getSla(config, getSlaSuccessCbk, getSlaErrorCbk);

			function getSlaSuccessCbk(data){

				var ctxChart1 = document.getElementById("chart1");
				var ctxChart2 = document.getElementById("chart2");

				var chartOptions = {
					scales: {
						gridLines: {

						}
					}
				};

				var chartData1 = {
					labels: [
						"Red",
						"Blue",
						"Yellow"
					],
					datasets: [
						{
							data: [300, 50, 100],
							backgroundColor: [
								"#FF6384",
								"#36A2EB",
								"#FFCE56"
							],
							hoverBackgroundColor: [
								"#FF6384",
								"#36A2EB",
								"#FFCE56"
							]
						}]
				};

				// And for a doughnut chart
				var chartInst1 = new Chart(ctxChart1, {
					type: 'doughnut',
					data: chartData1,
					options: chartOptions
				});

				// And for a doughnut chart
				var chartInst2 = new Chart(ctxChart2, {
					type: 'doughnut',
					data: chartData1,
					options: chartOptions
				});


			}

			function getSlaErrorCbk(err){
				ErrorHandlerService.log(err);
			}

		}





	};

	IoamAppCtrl.$inject = ["$scope", "$mdSidenav", "$mdDialog", "ApiService", "SharedDataService", "ErrorHandlerService"];
	app.controller("IoamAppCtrl", IoamAppCtrl);

})(app);