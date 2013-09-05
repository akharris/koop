var Geohub = require('geohub');

module.exports = {
  find: function( id, callback ){
    // looks for data in the cache first
    var type = 'Gist';
    Cache.get( type, id, function(err, entry ){
      if ( err ){
        Geohub.gist( { id: id, token: sails.config.github_token }, function( err, geojson ){
          console.log('ERROR', err)
          if ( !geojson.length ){
            geojson = [ geojson ];
          }
          Cache.insert( type, id, JSON.stringify( geojson ), function( err, success){
            if ( success ) callback( null, geojson );
          });
        });
      } else {
        callback( null, JSON.parse(entry) );
      }
    });
  },
  
  // compares the updated_at timestamp on the cached data and the hosted data
  // this method name is special reserved name that will get called by the cache model
  checkCache: function(id, data, callback){
    var json = JSON.parse( data );
    Geohub.gistSha(id, sails.config.github_token, function(err, sha){
      if ( sha == json[0].updated_at ){
        callback(null, false);
      } else {
        Geohub.gist( { id: id, token: sails.config.github_token }, function( err, geojson ){
          callback(null, { data: JSON.stringify(geojson) });  
        });
      }
    });
  }  
};
