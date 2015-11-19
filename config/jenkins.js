var fs = require('fs');

exports.default = {
  jenkins: function(api){
	return JSON.parse(fs.readFileSync( __dirname + '/jenkins.json', 'utf8'));
  }
}
