(function(app){

	/*
	 ChartService
	 This service contains functions that help a dev with routine work
	 */

	var ChartService = function(){

		var self = this;
		this.createDonutChart = createDonutChart;
		this.createBarChart = createBarChart;

		/**
		 * Creates Doughnut chart with 2 values
		 * @param config {*} Array/object {htmlId: string, activePercentage: integer}.
		 * If Object, creates a chart for htmlId, share of green slice = activePercentage
		 * If Array, loops through each item and handles it as an Object
		 * @param pathName {String} Unique name of Path
		 * @returns {Array} new Chart objects
		 */
		function createDonutChart(config, pathName){

			var configArr = [];

			// if a set of config
			if(Array.isArray(config)){

				configArr = config.map(function(chartConfig){
					return self.createDonutChart(chartConfig, pathName);
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

				var chartCtx = document.getElementById(config.htmlId + "-" + pathName).getContext("2d");

				var chartInst = new Chart(chartCtx, {
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


		/**
		 * Creates Bar chart of 3 values
		 * @param config {*} Array/object {htmlId: string, activePercentage: integer}.
		 * If Object, creates a chart for htmlId, share of green slice = activePercentage
		 * If Array, loops through each item and handles it as an Object
		 * @param pathName {String} Unique name of Path
		 * @returns {Array} new Chart objects
		 */
		function createBarChart(config, pathName){

			var configArr = [];

			// if a set of config
			if(Array.isArray(config)){

				configArr = config.map(function(chartConfig){
					return self.createBarChart(chartConfig, pathName);
				});
				return configArr;

			}

			// if a single config
			else if( (typeof config === "object") && config !== null ){

				console.log(config);

				var chartOptions = {
					scales: {
						gridLines:{}
					},
					legend: {
						display: false
					}
				};

				var labelsOnly = [];
				var valuesOnly = [];

				config.bars.forEach(function(bar){

					valuesOnly.push(bar.value);
					labelsOnly.push(bar.label);

				});


				var chartData = {
					labels: labelsOnly,
					datasets: [
						{
							data: valuesOnly,
							backgroundColor: [
								"#ff0000"
							],
							hoverBackgroundColor: [
								"#ff0000"
							]
						}]
				};

				// Compile

				var chartCtx = document.getElementById(config.htmlId + "-" + pathName).getContext("2d");

				var chartInst = new Chart(chartCtx, {
					type: 'bar',
					data: chartData,
					options: chartOptions
				});

				return chartInst;

			}

		}



	};

	ChartService.$inject = [];
	app.service("ChartService", ChartService);

})(app);