
// Read the Jenkins URL:
var url = process.env.JENKINS || process.argv[3];

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

          // Merge objects and create if necessary
          // 1. identify documents to remove
          // 2. identify documents to insert
          // 3. identify documents to update
          async.forEachOf(jobs,function(item, i,callback){

            jenkins.job.get(item.name,function(err, job) {

              job._url = url + job.url.replace(/^http:\/\/[^\/]+/,'');

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
                },{ $set: job }),{new:true,upsert:true},function(err, result){
                  console.log(err,result.value);
                  jobs[i] = result.value;
                  callback();
                });

            });
          },function(){
            data.response.jobs = jobs;
            next(error);

          });
    });
  }
};

exports.update = {
  name:                   'updateJenkinsJob',
  description:            'Update a jenkins jobs',
  blockedConnectionTypes: [],
  outputExample:          {},
  matchExtensionMimeType: false,
  version:                1.0,
  toDocument:             true,
  middleware:             [],

  inputs: {},

  run: function(api, data, next){
    var error = null;

    var _url = data.url;
    // console.log( 77 , data.connection.rawConnection.params.body );
    var job = data.connection.rawConnection.params.body;

    delete job.action;
    delete job._id;
    delete job.updated;
    // console.log( 80 , job );

    api.mongo.collection.findAndModify(
      {
        url: job.url
      },{},_.extend(job,{
          updated: new Date()
        }),{new:true},function(err, result){
        // console.log(err, result);
        api.log('Updated job: ' + result.value.url );
        data.response.job = result.value;
        next(error);
      });

  }
};

exports.config = {
  name:                   'getJenkinsConfig',
  description:            'Retrieve the Jenkins config',
  blockedConnectionTypes: [],
  outputExample:          {},
  matchExtensionMimeType: false,
  version:                1.0,
  toDocument:             true,
  middleware:             [],

  inputs: {},

  run: function(api, data, next){
    var error = null;

    if( undefined === api.config.jenkins ) {
    	error = new Error('config not loaded')
    } else {
    	data.response.config = api.config.jenkins;
    }
    next(error);
  }
};

