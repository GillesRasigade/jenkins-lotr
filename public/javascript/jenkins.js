(function(exports){
  
  // Jenkins class definition:
  var Jenkins = function () {
    this.client = new ActionheroClient();
  }
  
  /**
   * Jenkins get  the full list of jobs
   */
  Jenkins.prototype.jobs = function jobs( callback ) {
    this.client.action('getJenkinsJobs', function(data){
      //console.log( 'getJenkinsJobs: ' , data );
      callback( data.jobs );
    });
    return this;
  }
  
  Jenkins.prototype.drag = function drag() {
    var _this = this, start = {};
    document.addEventListener('dragstart',function(event){
      start = { x: event.screenX, y: event.screenY };
      if ( _this._interval ) clearInterval( _this._interval );
    });
    document.addEventListener('dragend',function(event){
      var target = $(event.target);
      if(!target.hasClass('jenkins-job-container')) {
        if( target.parent().hasClass('jenkins-job-container')) {
          var target = target.parent()
        } else {
          var target = target.parent().parent()
        }
      }
      target.css('margin-left', parseInt(target.css('margin-left').replace('px',''),10) + ( event.screenX - start.x ));
      target.css('margin-top', parseInt(target.css('margin-top').replace('px',''),10) + ( event.screenY - start.y ));
    });
  }
  
  Jenkins.prototype.init = function init( callback ) {
    var _this = this;
    this._$jobs = $('body');
    
    this.client.action('getJenkinsConfig', function(data){
      // console.log( 'getJenkinsConfig: ' , data );
      _this.config = data.config;
      _this._$jobs.css('background-image', 'url(' + _this.config.backgroundImage + ')');
      var image = new Image();
      image.onload = function(){  
        _this.imageRatio = image.height / image.width;
      
        _this.drag();
        _this.reload();
        var frequency = _this.config.reloadFrequency || 60000;
        _this._interval = setInterval(function(){
          _this.reload();
        },frequency);
      }
      image.src = _this.config.backgroundImage;
    });
  }
  
  Jenkins.prototype.reload = function reload( callback ) {
    
    var _this = this;
    this.jobs(function(jobs){
      
      // Remove all possible created elements:
      $('.jenkins-job-container').remove();
      
      jobs.forEach(function(job,i){
        
        var $div = $('<div id="job-'+job.name+'" class="jenkins-job">');
        
        var x = undefined != job.x ? job.x : Math.random();
        var y = undefined != job.y ? job.y : Math.random();
        var r = undefined != job.r ? job.r : 32;
        
        x *= window.innerWidth;        
        y *= ( _this.imageRatio * window.innerWidth );        
        r += 32 * ( 100 - job.healthReport[0].score ) / 100
        
        $div
          .css('width', r)
          .css('height', r)
      	  .addClass('halo-' + job.color.replace('_anime', ''));
              
      	var mappingKey = job.healthReport[0].iconUrl;
        var map = _this.config.imagesMapping[mappingKey];
      	if( undefined !== map ) {
      	  var url = undefined !== map[job.name] ?map[job.name] : map.default;
      	  $div.css('background-image', 'url(' + url + ')');
      	} else {
          var url = 'https://cdn.rawgit.com/jenkinsci/jenkins/jenkins-1.638/war/src/main/webapp/images/48x48/'+mappingKey;
        }
        $div.css('background-image', 'url(' + url + ')')
        
        var $span = $('<a href="'+job._url+'" target="_blank">' + job.name + '</a>');
        $span
          .css('padding-left',r+10)
          .css('top', Math.max(0,r-30)/2)
        
        $div.append($span);

      	var $container = $('<div id="job-'+job.name+'-container" class="jenkins-job-container" draggable="true">')
      	  .css('box-shadow','0px 0px '+((100-job.healthReport[0].score)*1)+'px '+((100-job.healthReport[0].score)/2)+'px rgba(0,0,0,0.75)')
      	  .css('margin-left', (x) + 'px')
          .css('margin-top', (y) + 'px')
          .css('width', r)
          .css('height', r);
          if(job.color.indexOf('_anime') !== -1) {
            $container.addClass('anime');
          }
        // Appending:
        _this._$jobs.append( $container.append($div) );
      })
    })
  }
  
  
  Jenkins.prototype.save = function save ( callback ) {
    var _this = this;
    this.jobs(function(jobs){
      jobs.forEach(function(job,i){
        
        var $div = $('#job-'+job.name+'-container');
        job.x = parseFloat( $div.css('margin-left') ) / window.innerWidth;
        job.y = parseFloat( $div.css('margin-top')) / ( _this.imageRatio * window.innerWidth );
        
        _this.client.action('updateJenkinsJob', job, function(data){

        });
      });
    });
  };
  
  $(document).ready(function(){
    var jenkins = exports.jenkins = new Jenkins();
    console.log( 'Jenkins initialization' , jenkins.init() );
  });
  
  
})(typeof exports === 'undefined' ? window : exports);
