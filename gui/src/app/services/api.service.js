(function(app){

	/*
	ApiService
	The service does REST API work
	 */

	var ApiService = function(Restangular, HelpersService){

		this.getSla = getSla;

		function getSla(config, successCbk, errorCbk){

			var restObj = Restangular.setBaseUrl(config.url).one("sla");

			var restCallData = {
				"StartTime": config.startTime,
				"EndTime": config.endTime,
				"target-delay": config.targetDelay,
				"target-jitter": config.targetJitter
			};

			//var data = {
			//	"SLA compliance": [
			//		{
			//			"total-percent-packets-in-policy": 99,
			//			"15min-percent-packets-out-of-policy": 22,
			//			"Delay_compliance_deviation_1": 3,
			//			"Delay_compliance_deviation_10": 5,
			//			"total-percent_jitter_out_of_compliance": 10,
			//			"15min-percent-packets-lost": 2,
			//			"1hr-percent-packets-lost": 2,
			//			"jitter_compliance_deviation_10": 8,
			//			"total-percent-packets-lost": 10,
			//			"total-percent-delay_out_of_compliance": 67,
			//			"1min-percent-packets-lost": 6,
			//			"1hr-percent-packets-out-of-policy": 34,
			//			"jitter_compliance_deviation_g10": 4,
			//			"total-percent-packets-out-of-policy": 1,
			//			"Total packets": 12334234,
			//			"Path": "vpp1->vpp2->vpp3",
			//			"Delay_compliance_deviation_g10": 1,
			//			"1min-percent-packets-out-of-policy": 0,
			//			"total-percent-packets-received": 90,
			//			"jitter_compliance_deviation_1": 2
			//		},
			//		{
			//			"total-percent-packets-in-policy": 80,
			//			"15min-percent-packets-out-of-policy": 12,
			//			"Delay_compliance_deviation_1": 3,
			//			"Delay_compliance_deviation_10": 5,
			//			"total-percent_jitter_out_of_compliance": 10,
			//			"15min-percent-packets-lost": 0,
			//			"1hr-percent-packets-lost": 1,
			//			"jitter_compliance_deviation_10": 8,
			//			"total-percent-packets-lost": 1,
			//			"total-percent-delay_out_of_compliance": 7,
			//			"1min-percent-packets-lost": 0,
			//			"1hr-percent-packets-out-of-policy": 15,
			//			"jitter_compliance_deviation_g10": 4,
			//			"total-percent-packets-out-of-policy": 20,
			//			"Total packets": 123123,
			//			"Path": "vpp1->vpp4->vpp3",
			//			"Delay_compliance_deviation_g10": 1,
			//			"1min-percent-packets-out-of-policy": 10,
			//			"total-percent-packets-received": 99,
			//			"jitter_compliance_deviation_1": 1
			//		}
			//	]
			//};
			//
			//successCbk(data["SLA compliance"]);

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