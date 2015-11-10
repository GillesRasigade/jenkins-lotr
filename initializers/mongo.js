var mongoPackage = require('mongodb');

module.exports = {
  start: function (api, next) {

    api.mongo = {};
    api.mongo.client = {};
    api.mongo.enable = api.config.mongo.enable;
    api.mongo.client = mongoPackage.MongoClient;

    api.log("configuring MongoDB "+api.config.mongo.enable, "notice");

    if (true === api.config.mongo.enable) {

        var url = 'mongodb://'+api.config.mongo.host+':'+api.config.mongo.port+'/'+api.config.mongo.db;

        api.mongo.client.connect(url, function(err, db) {
            if(err) {
                api.log(err+"error in mongoDB connection", "notice");
                next();
                } else {

                    api.log("mongoDB connection ok ", "notice");
                    api.mongo.db = db;
                    api.mongo.collection = db.collection( api.config.mongo.collection );
                    next();
                }
        });
    }
  },
  stop: function(api, next){
    api.log("stopping mongoDB connection");
    api.mongo.db.close(next);
  }
}
