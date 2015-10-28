
// Read the Jenkins URL:
var url = process.argv[3];

// Init Jenkins module:
var jenkins = require('jenkins')(url);
var async   = require('async');
var _       = require('underscore');

exports.jobs = {
  name:                   'getJenkinsJobs',
  description:            'Retrieve the Jenkins jobs',
  blockedConnectionTypes: [],
  outputExample:          {},
  matchExtensionMimeType: false,
  version:                1.0,
  toDocument:             true,
  middleware:             [],

  inputs: {},

  run: function(api, data, next){
    var error = null;
    
    // Get the fresh list of Jenkins jobs:
    jenkins.job.list(function(err, jobs) {
      if (err) throw err;
      
      // Get db object or initialize it
      // api.mongo.collection
      //   .find({
      //     url: new RegExp( '/^'+url+'/' )
      //   })
      //   .limit(1)
      //   .toArray(function(err, results){
          
          // Merge objects and create if necessary
          // 1. identify documents to remove
          // 2. identify documents to insert
          // 3. identify documents to update
          async.forEachOf(jobs,function(item, i,callback){
            console.log( 41 , item );
            
            // api.mongo.collection
            //   .updateOne({
            //     url: item.url
            //   }, _.extend({
            //     $set: {
            //       updated: new Date()
            //     },
            //     $setOnInsert: {
            //       updated: new Date(),
            //       created: new Date()
            //     }
            //   },{ $set: item }), { upsert: true, safe: true, raw: true }, function(err, result){
            //     console.log(err,result);
            //     callback();
            // });
            
            api.mongo.collection.findAndModify(
              {
                url: item.url
              },{},_.extend({
                $set: {
                  updated: new Date()
                },
                $setOnInsert: {
                  updated: new Date(),
                  created: new Date()
                }
              },{ $set: item }),{new:true,upsert:true},function(err, result){
                console.log(err,result.value);
                jobs[i] = result.value;
                callback();
              });
            
            // api.mongo.collection.find({
            //   url: item.url
            // }).toArray(function(err, results){
            //   console.log(53 , iteresults);
            //   callback();
            // })
            
            // api.mongo.collection
            //   .findAndModify({
            //     query: {
            //       url: item.url
            //     },
            //     update: item,
            //     new: true,
            //     upsert: true
            //   }).toArray(function(err, i){
            //     console.log( 48 , i );
                
            //     callback();
            //   });
          },function(){
            // console.log(err, results);
            data.response.jobs = jobs;
            
            next(error);
            
          })
          
          
        // });
    });
  }
};