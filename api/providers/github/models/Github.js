var Geohub = require('geohub');

module.exports = {
  find: function( user, repo, file, callback ){
    file = ( file ) ? file.replace(/::/g, '/') : null;

    var key = [ user, repo, file].join('/'),
      type = 'Github';
    
    Cache.get( type, key, function(err, entry ){
      if ( err ){
        Geohub.repo( user, repo, file, sails.config.github_token, function( err, geojson ){
          if ( !geojson.length ){
            geojson = [ geojson ];
          }
          Cache.insert( type, key, JSON.stringify( geojson ), function( err, success){
            if ( success ) callback( null, geojson );
          });
        });
      } else {
        callback( null, JSON.parse( entry ) );
      }
    });
  },

  // compares the sha on the cached data and the hosted data
  // this method name is special reserved name that will get called by the cache model
  checkCache: function(key, data, callback){
    var json = JSON.parse( data );
    key = key.split('/');
    var user = key.shift();
    var repo = key.shift();
    var path = key.join('/') + '.geojson';

    Geohub.repoSha(user, repo, path, sails.config.github_token, function(err, sha){
      if ( sha == json[0].sha ){
        callback(null, false);
      } else {
        Geohub.repo( user, repo, path, sails.config.github_token, function( err, geojson ){
          callback(null, { data: JSON.stringify(geojson) });
        });
      }
    });
  }
};
