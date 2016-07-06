(function(app){

	/*
	 ChartService
	 This service contains functions that help a dev with routine work
	 */

	var ChartService = function(){

		var self = this;
		this.createDonutChart = createDonutChart;

		function createDonutChart(config){

			var configArr = [];

			// if a set of config
			if(Array.isArray(config)){

				configArr = config.map(function(chartConfig){
					return self.createDonutChart(chartConfig);
				});
				return configArr;

			}

			// if a single config
			else if( (typeof config === "object") && config !== null ){

				var chartOptions = {
					scales: {
						gridLines:{}
					},
					legend: {
						display: false
					}
				};

				var chartData = {
					labels: [
						"Green",
						"Red"
					],
					datasets: [
						{
							data: [config.activePercentage, 100 - config.activePercentage],
							backgroundColor: [
								"#009933",
								"#ff0000"
							],
							hoverBackgroundColor: [
								"#009933",
								"#ff0000"
							]
						}]
				};

				// Compile

				var ctx = document.getElementById(config.htmlId).getContext("2d");

				var chartInst = new Chart(ctx, {
					type: 'doughnut',
					data: chartData,
					options: chartOptions
				});

				Chart.pluginService.register({
					beforeDraw: function(chart) {

						if(chartInst === chart){
							var width = chart.chart.width,
								height = chart.chart.height,
								ctx = chart.chart.ctx;

							ctx.restore();
							var fontSize = (height / 114).toFixed(2);
							ctx.font = fontSize + "em sans-serif";
							ctx.textBaseline = "middle";

							var text = config.activePercentage + "%",
								textX = Math.round((width - ctx.measureText(text).width) / 2),
								textY = height / 2;

							ctx.fillText(text, textX, textY);
							ctx.save();
						}


					}
				});

				return chartInst;

			}






		}

		function createBarChart(){

		}



	};

	ChartService.$inject = [];
	app.service("ChartService", ChartService);

})(app);