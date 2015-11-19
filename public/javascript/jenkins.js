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
    // setTimeout(function(){
    document.addEventListener('dragstart',function(event){
      // console.log(22 , 'ondrop' , event.pageX , event.target.style.left );
      // var target = event.target;
      // target.style.left = event.pageX;
      start = { x: event.pageX, y: event.pageY };
      if ( _this._interval ) clearInterval( _this._interval );
    });
    document.addEventListener('dragend',function(event){
      // console.log(22 , 'ondrop' , event.pageX , event.target.style.left );
      // var target = event.target;
      // target.style.left = event.pageX;
      console.log( 22 , start , event.pageX , event.pageY );
      event.target.style.left = parseInt(event.target.style.left,10) + ( event.pageX - start.x );
      event.target.style.top = parseInt(event.target.style.top,10) + ( event.pageY - start.y );
    });
  }
  
  Jenkins.prototype.init = function init( callback ) {
    var _this = this;
    this._$jobs = $('body');
   // this._$jobs.css('background-image', 'url(../images/middle-earth-map.jpg)');
    
    this.client.action('getJenkinsConfig', function(data){
      console.log( 'getJenkinsConfig: ' , data );
      _this.config = data.config;
      _this._$jobs.css('background-image', 'url(' + _this.config.backgroundImage + ')');
    
    // this._$jobs.height( window.innerWidth / 3000 * 1713 )
    
      _this.drag();
      _this.reload();
      _this._interval = setInterval(function(){
        _this.reload();
      },60000);
    });
  }
  
  Jenkins.prototype.reload = function reload( callback ) {
    
    // Remove all possible created elements:
    
    var _this = this;
    this.jobs(function(jobs){
      
      $('.jenkins-job-container').remove();
      
      jobs.forEach(function(job,i){
        
        var $div = $('<div id="job-'+job.name+'" class="jenkins-job">');
        
        var x = undefined != job.x ? job.x : Math.random();
        var y = undefined != job.y ? job.y : Math.random();
        var r = undefined != job.r ? job.r : 32;
        
        x *= window.innerWidth;
        // y *= window.innerHeight;
        // x *= _this._$jobs.width();
        // x *= 3000 / window.innerWidth;
        // y *= _this._$jobs.height();
        
        y *= ( 1713 / 3000 * window.innerWidth );
        
//        if ( 'blue' === job.color ) {
//          job.color = '#33ee33';
//        }
        
        r += 32 * ( 100 - job.healthReport[0].score ) / 100
        
        $div
          .css('width', r)
          .css('height', r)
	  .addClass('halo-' + job.color);
        
	var mappingKey = job.healthReport[0].iconUrl; 
	if( undefined !== _this.config.imagesMapping[mappingKey] ) {
	  var url = undefined !== _this.config.imagesMapping[mappingKey][job.name] ? _this.config.imagesMapping[mappingKey][job.name] : _this.config.imagesMapping[mappingKey].default;
	  $div.css('background-image', 'url(' + url + ')');
	} else {
          $div.css('background-image', 'url(https://cdn.rawgit.com/jenkinsci/jenkins/jenkins-1.638/war/src/main/webapp/images/48x48/'+mappingKey+')')

	}
        // div.style['border-color'] = ( job.color ? job.color : 'red' );
        // div.title = job.name;
        // div.draggable = true;
        
        var $span = $('<a href="'+job._url+'" target="_blank">' + job.name + '</a>');
        $span
          .css('padding-left',r+10)
          .css('top', Math.max(0,r-30)/2)
        
        $div.append($span);

	var $otherDiv = $('<div id="job-'+job.name+'-container" class="jenkins-job-container" draggable="true">')
	  .css('box-shadow','0px 0px '+((100-job.healthReport[0].score)*1)+'px '+((100-job.healthReport[0].score)/2)+'px rgba(0,0,0,0.75)')
	  .css('left', (x) + 'px')
          .css('top', (y) + 'px')
          .css('width', r)
          .css('height', r);
        $otherDiv.append($div);
        // Appending:
        _this._$jobs.append( $otherDiv );
      })
    })
  }
  
  
  Jenkins.prototype.save = function save ( callback ) {
    var _this = this;
    this.jobs(function(jobs){
      jobs.forEach(function(job,i){
        
        var $div = $('#job-'+job.name+'-container');
        job.x = parseFloat( $div.css('left') ) / window.innerWidth;
        // job.y = parseFloat( $div.css('top')) / window.innerHeight;
        job.y = parseFloat( $div.css('top')) / ( 1713 / 3000 * window.innerWidth );
        
        _this.client.action('updateJenkinsJob', job, function(data){
          // console.log( 'updateJenkinsJob: ' , job , data );
          // callback( data.jobs );
        });
      });
    });
  };
  
  $(document).ready(function(){
    var jenkins = exports.jenkins = new Jenkins();
    console.log( 'Jenkins initialization' , jenkins.init() );
  });
  
  
})(typeof exports === 'undefined' ? window : exports);
