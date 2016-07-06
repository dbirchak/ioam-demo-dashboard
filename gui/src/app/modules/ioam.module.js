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
