var request = require('request')
  , qs = require('querystring')
  , async = require('async');

module.exports = function routes(app){

  var automaticAPI = app.get('automaticAPI');

  app.get('/', function(req, res) {
    if(req.session && req.session.access_token) {
      res.sendfile(__dirname + '/public/map.html');
    } else {
      res.sendfile(__dirname + '/public/signin.html');
    }
  });


  app.get('/logout/', function(req, res) {
    req.session.destroy();
    res.redirect('/');
  });


  app.get('/redirect/', function(req, res) {
    if(req.query.code) {
      request.post({
        uri: automaticAPI.automaticAuthTokenUrl,
        form: {
            client_id: automaticAPI.automaticClientId
          , client_secret: automaticAPI.automaticClientSecret
          , code: req.query.code
          , grant_type: 'authorization_code'
        }
      }, saveAuthToken)
    } else {
      res.json({error: 'No code provided', response: body});
    }

    function saveAuthToken(e, r, body) {
      var access_token = JSON.parse(body || '{}')
      if (access_token.access_token) {
        req.session.access_token = access_token.access_token;
        req.session.user_id = access_token.user.id;
        req.session.scopes = access_token.scopes;
        res.redirect('/');
      } else {
        res.json({error: 'No access token', response: body});
      }
    }
  });


  app.post('/webhook/', function(req, res) {
    if(req.body) {
      var wss = app.get('wss');
      wss.sendEvent(req.body);
      res.json({success: true});
    }
  });

  app.get('/authorize/', function(req, res) {
    res.redirect(automaticAPI.automaticAuthorizeUrl + '?client_id=' + automaticAPI.automaticClientId + '&response_type=code&scope=' + automaticAPI.automaticScopes)
  });
}
