var connect = require('connect');
var serveStatic = require('serve-static');

var dirName = __dirname + "/gui/build";

connect().use(serveStatic(dirName)).listen(8080, function(){
	console.log('Server running on 8080...');
});