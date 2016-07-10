(function(app){

	/*
	ApiService
	The service does REST API work
	 */

	var ApiService = function(Restangular, HelpersService){

		this.getSla = getSla;

		function getSla(config, successCbk, errorCbk){

			if(config.url === "") config.url = window.location.protocol + "//" + window.location.hostname + ":" + window.location.port;

			var restObj = Restangular.setBaseUrl(config.url).one("sla");

			var restCallData = {
				"StartTime": config.startTime,
				"EndTime": config.endTime,
				"target-delay": config.targetDelay,
				"target-jitter": config.targetJitter
			};

			restObj.customPOST(restCallData).then(
				function(data) {
					if(HelpersService.hasOwnPropertiesPath(data, ["SLA compliance"])){
						successCbk(data["SLA compliance"]);
					}
					else{
						var errData = {
							"errCode": "GET_SLA_INVALID",
							"errTitle": "Couldn't read SLA compliance data",
							"errMsg": "SLA compliance data is invalid.",
							"errResolution": "Make sure that protocols match.",
							"errObj": data
						};
						errorCbk(errData);
					}
				},
				function(err){

					var errData = {
						"errCode": "GET_SLA",
						"errTitle": "Couldn't get SLA compliance data",
						"errMsg": "You tried to read SLA compliance data from server, but for some reason it is being complicated at this point.",
						"errResolution": "Check your connection, otherwise make sure if REST server is up.",
						"errObj": err
					};

					errorCbk(errData);

				}
			);

		}

	};

	ApiService.$inject = ["Restangular", "HelpersService"];
	app.service("ApiService", ApiService);

})(app);