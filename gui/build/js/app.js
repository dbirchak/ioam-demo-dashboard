var configFn, app;

// module configuration function
configFn = function($mdThemingProvider, RestangularProvider) {

	$mdThemingProvider.theme("default")
		.primaryPalette("blue")
		.accentPalette("light-blue");


	// todo: make URL dynamic
	RestangularProvider.setBaseUrl("http://10.60.19.11:8080/ioam");
};
configFn.$inject = ["$mdThemingProvider", "RestangularProvider"];

// define module
app = angular.module("ioamApp", ["ngMaterial", "restangular", "md.data.table"]);
// configuration of color themes
app.config(configFn);

/*
How to use:

ErrorHandlerService.log(err[, displayErrConfig]);

err is an Object that contains information about the error. It is mandatory to pass the Object into .log() function.

The structure is as follows (with example):

err = {
	"errCode": "REGSTATS_NOT_LOADED", // code of error (must be unique in scope of the project)
	"errTitle": "Registration data is not loaded", // short description of what happened
	"errMsg": "Couldn't load Registration information from controller. Server does not respond.", // moderately detailed description of the error
	"errResolution": "Check if controller is down, otherwise check your connection.", // optional: resolution of the problem
	// Optional: an object that may be processed in different ways, thanks to errCode.
	// Contains details of the problem (may be anything that helps identify and fix the reason without debugging the code)
	"errObj": {
		"testProp": "testValue"
	}
};

displayErrConfig can be boolean (true/false) or an Object. Optional.

If missing or false, user doesn't see the error.
If true, it shows pop-up by default (see this.defaultMethod)
If Object, it must have "type" property, which must be one of the following:
- dialog: depict as a dialog window
- toast: depict as a small pop-up notification in a corner
- default: same as if displayErrConfig === true, that is it choose default method
- hide: same as if displayErrConfig === false, that is it hides the error from user
As the Object it may have a boolean property allowToLogInConsole, which determines if the message needs putting to console (true = put, false = do not)
 */

(function(app){

	var ErrorHandlerService = function($log, $mdDialog, $mdToast) {

		// If true, track errors in the console
		this.debug = true;
		this.defaultMethod = 'toast';

		/**
		 * A tiny pop-up at the top right corner. Can expand to a dialog window
		 * @param err {Object} Error object with the following properties: errCode, errTitle, errMsg, errResolution, errObj
		 */
		this.displayMDToast = function(err){
			$mdToast.show({
				hideDelay   : 10000,
				position    : 'bottom right',
				controller  : 'ErrorHandlerCtrl',
				templateUrl : 'templates/error-views/toast.tpl.html',
				locals: {
					'errData': err
				}
			});
		};

		/**
		 * Open a dialog window for the error
		 * @param err {Object} Error object with the following properties: errCode, errTitle, errMsg, errResolution, errObj
		 */
		this.displayMDDialog = function(err){
			var parentEl = angular.element(document.body);
			$mdDialog.show({
				parent: parentEl,
				controller  : 'ErrorHandlerCtrl',
				templateUrl : 'templates/error-views/dialog.tpl.html',
				clickOutsideToClose: true,
				locals: {
					'errData': err
				}
			});
		};

		/**
		 * Display error to user by default
		 * @param err {Object} Error object with the following properties: errCode, errTitle, errMsg, errResolution, errObj
		 */
		this.displayPopupByDefault = function(err){
			switch(this.defaultMethod){
				case 'toast':
					this.displayMDToast(err);
					break;
				case 'dialog':
					this.displayMDDialog(err);
					break;
			}
		};

		/**
		 * Track error
		 * @param err {Object} Error object with the following properties: errCode, errTitle, errMsg, errResolution, errObj
		 * @param displayErrConfig {Boolean} Do we need to show the error to a user?
		 */
		this.log = function(err, displayErrConfig){

			displayErrConfig = displayErrConfig || false;

			var consoleMessagesAllowed = true;

			// if user needs to see it
			if(displayErrConfig){
				// default settings
				if(displayErrConfig === true){
					this.displayPopupByDefault(err);
				}
				// explicitly defined configuration
				else{
					if(displayErrConfig.hasOwnProperty('type')){
						switch(displayErrConfig.type){
							// display as a dialog
							case 'dialog':
								this.displayMDDialog(err);
								break;
							// display as a toast
							case 'toast':
								this.displayMDToast(err);
								break;
							// pop-up by default
							case 'default':
								this.displayPopupByDefault(err);
								break;
							// show nothing
							case 'hide':
								break;
						}
					}
					else{
						// action by default
						this.displayPopupByDefault(err);
					}

					// allowToLogInConsole implementation
					if(displayErrConfig.hasOwnProperty('allowToLogInConsole')){
						consoleMessagesAllowed = (typeof displayErrConfig.allowToLogInConsole == 'boolean') ?
							displayErrConfig.allowToLogInConsole : false;
					}
				}
			}

			// "debug" mode allows messages appear in console
			if(this.debug && consoleMessagesAllowed)
				$log.error("Error occurred.", err);

		};
	};

	ErrorHandlerService.$inject = ['$log', '$mdDialog', '$mdToast'];
	app.service("ErrorHandlerService", ErrorHandlerService);

})(app);
(function(app){

	/*
	SharedDataService
	The service provides controllers and services access communicate with each other avoiding $scope routine
	 */

	var SharedDataService = function(){

		var self = this;

		this.multiSet = multiSet;

		// shared data
		this.data = {

			// side panel details
			sidePanel: false,
			sidePanelName: null,

			// shared functions
			openPanel: null
		};

		/* Implementation */

		/**
		 * Copy properties of "sourceObj" into shared data object
		 * @param sourceObj {Object} Donor object
		 * @param deepCopy {Boolean} Perform deep copy or not
		 */
		function multiSet(sourceObj, deepCopy){

			deepCopy = deepCopy || false;

			for (var property in sourceObj) {
				if (sourceObj.hasOwnProperty(property)) {
					if(deepCopy)
						self.data[property] = angular.copy(sourceObj[property]);
					else
						self.data[property] = sourceObj[property];
				}
			}
		}

	};

	SharedDataService.$inject = [];
	app.service("SharedDataService", SharedDataService);

})(app);

(function(app){

	/*
	HelpersService
	This service contains functions that help a dev with routine work
	 */

	var HelpersService = function(){

		this.hasOwnPropertiesPath = hasOwnPropertiesPath;
		this.debounce = debounce;
		this.arraySum = arraySum;

		/**
		 * If an object "a" has a path [b, c, d], it verifies if the object a.b.c.d exists
		 * @param sourceObj {Object}
		 * @param path {Array}
		 */
		function hasOwnPropertiesPath(sourceObj, path){

			var currentObject = sourceObj;

			for(var i = 0; i < path.length; i++){
				if(currentObject.hasOwnProperty(path[i])){
					currentObject = currentObject[path[i]];
				}
				else{
					return false;
				}
			}
			return true;

		}

		/**
		 * Debouncing function (allows increase performance)
		 * @param func {Function} Callback function
		 * @param wait {Number} Integer: number of milliseconds to wait
		 * @param immediate {Boolean} If needed to call immediately
		 * @returns {Function}
		 */
		function debounce(func, wait, immediate) {
			var timeout;
			return function() {
				var context = this, args = arguments;
				var later = function() {
					timeout = null;
					if (!immediate) func.apply(context, args);
				};
				var callNow = immediate && !timeout;
				clearTimeout(timeout);
				timeout = setTimeout(later, wait);
				if (callNow) func.apply(context, args);
			};
		}

		function arraySum(arr){
			var total = 0;
			arr.forEach(function(el){
				total += el;
			});
			return total;
		}

	};

	HelpersService.$inject = [];
	app.service("HelpersService", HelpersService);

})(app);
(function(app){

	/*
	NetworkService
	The service does REST API work that has to do with topology/network
	 */

	var ApiService = function(Restangular, HelpersService){

		this.getSla = getSla;

		function getSla(config, successCbk, errorCbk){

			//var restObj = Restangular.setBaseUrl("http://10.60.19.11:8080/ioam").one("sla");

			var data = {
				"SLA compliance": [
					{
						"total-percent-packets-in-policy": 99,
						"15min-percent-packets-out-of-policy": 22,
						"Delay_compliance_deviation_1": 3,
						"Delay_compliance_deviation_10": 5,
						"total-percent_jitter_out_of_compliance": 10,
						"15min-percent-packets-lost": 2,
						"1hr-percent-packets-lost": 2,
						"jitter_compliance_deviation_10": 8,
						"total-percent-packets-lost": 10,
						"total-percent-delay_out_of_compliance": 67,
						"1min-percent-packets-lost": 6,
						"1hr-percent-packets-out-of-policy": 34,
						"jitter_compliance_deviation_g10": 4,
						"total-percent-packets-out-of-policy": 1,
						"Total packets": 12334234,
						"Path": "vpp1->vpp2->vpp3",
						"Delay_compliance_deviation_g10": 1,
						"1min-percent-packets-out-of-policy": 0,
						"total-percent-packets-received": 90,
						"jitter_compliance_deviation_1": 2
					},
					{
						"total-percent-packets-in-policy": 80,
						"15min-percent-packets-out-of-policy": 12,
						"Delay_compliance_deviation_1": 3,
						"Delay_compliance_deviation_10": 5,
						"total-percent_jitter_out_of_compliance": 10,
						"15min-percent-packets-lost": 0,
						"1hr-percent-packets-lost": 1,
						"jitter_compliance_deviation_10": 8,
						"total-percent-packets-lost": 1,
						"total-percent-delay_out_of_compliance": 7,
						"1min-percent-packets-lost": 0,
						"1hr-percent-packets-out-of-policy": 15,
						"jitter_compliance_deviation_g10": 4,
						"total-percent-packets-out-of-policy": 20,
						"Total packets": 123123,
						"Path": "vpp1->vpp4->vpp3",
						"Delay_compliance_deviation_g10": 1,
						"1min-percent-packets-out-of-policy": 10,
						"total-percent-packets-received": 99,
						"jitter_compliance_deviation_1": 1
					}
				]
			};

			successCbk(data["SLA compliance"]);

			//restObj.customPOST(config).then(
			//	function(data) {
			//		if(HelpersService.hasOwnPropertiesPath(data, ["SLA compliance"])){
			//			successCbk(data["SLA compliance"]);
			//		}
			//		else{
			//			var errData = {
			//				"errCode": "GET_SLA_INVALID",
			//				"errTitle": "Couldn't read SLA compliance data",
			//				"errMsg": "SLA compliance data is invalid.",
			//				"errResolution": "Make sure that protocols match.",
			//				"errObj": data
			//			};
			//			errorCbk(errData);
			//		}
			//	},
			//	function(err){
			//
			//		var errData = {
			//			"errCode": "GET_SLA",
			//			"errTitle": "Couldn't get SLA compliance data",
			//			"errMsg": "You tried to read SLA compliance data from server, but for some reason it is being complicated at this point.",
			//			"errResolution": "Check your connection, otherwise make sure if REST server is up.",
			//			"errObj": err
			//		};
			//
			//		errorCbk(errData);
			//
			//	}
			//);

		}

	};

	ApiService.$inject = ["Restangular", "HelpersService"];
	app.service("ApiService", ApiService);

})(app);

(function(app){

	var ErrorHandlerCtrl = function($scope, errData, $mdToast, $mdDialog, ErrorHandlerService) {


		$scope.errData = errData;


		$scope.closeDialog = function(){
			$mdDialog.hide();
		};

		$scope.showMoreInfoInDialog = function(){
			$scope.closeToast();
			ErrorHandlerService.log($scope.errData, {
				type: "dialog",
				allowTologInConsole: false
			});
		};

		$scope.closeToast = function(){
			$mdToast
				.hide()
				.then(function() {

				});
		};

	};


	ErrorHandlerCtrl.$inject=['$scope', 'errData', '$mdToast', '$mdDialog', 'ErrorHandlerService'];
	app.controller("ErrorHandlerCtrl", ErrorHandlerCtrl);
})(app);
(function(app){

	var SidePanelCtrl = function($scope, $mdSidenav, SharedDataService) {

		$scope.closeSidePanel = closeSidePanel;

		// "scopify" shared data
		$scope.shared = SharedDataService.data;

		function closeSidePanel(fadeTopoLayers){

			// erase temporary data
			SharedDataService.data.sidePanel = false;
			SharedDataService.data.sidePanelName = null;

		}
	};

	SidePanelCtrl.$inject = ["$scope", "$mdSidenav", "SharedDataService"];
	app.controller("SidePanelCtrl", SidePanelCtrl);

})(app);

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