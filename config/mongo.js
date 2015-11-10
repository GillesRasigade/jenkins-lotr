exports.default = {
  mongo: function(api){
    return {
        enable: true,
        host: '127.0.0.1',
        port: 27017,
        db: 'jenkins',
        collection: 'jobs'
    }
  }
}