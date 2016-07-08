(function(app){

	/*
	HelpersService
	This service contains functions that help a dev with routine work
	 */

	var HelpersService = function(){

		this.hasOwnPropertiesPath = hasOwnPropertiesPath;
		this.debounce = debounce;
		this.arraySum = arraySum;
		this.isTrueObject = isTrueObject;
		this.hasOwnProperties = hasOwnProperties;

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

		function isTrueObject(testObj){
			return (typeof testObj === "object" && testObj !== null);
		}

		function hasOwnProperties(testObj, props){

			console.log(testObj, props);
			console.log(testObj, props);
			if(Array.isArray(props)){
				for(var i = 0; i < props.length; i++){
					if(!testObj.hasOwnProperty(props[i])){
						return false;
					}
				}
				return true;
			}
			return false;
		}

	};

	HelpersService.$inject = [];
	app.service("HelpersService", HelpersService);

})(app);