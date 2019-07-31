var parse = require('parse').Parse;

/*
    lookup function from passport-stormpath thanks to the stormpath team for putting this together
*/
function lookup(obj, field) {
  if (!obj) {
    return null;
  }

  if (typeof obj === 'object') {
    for (var prop in obj) {
      if (typeof obj[prop] === 'object') {
        return lookup(obj[prop], field);
      }
    }
  }

  var chain = field
    .split(']')
    .join('')
    .split('[');
  for (var i = 0, len = chain.length; i < len; i++) {
    var prop = obj[chain[i]];
    if (typeof prop === 'undefined') {
      return null;
    }
    if (typeof prop !== 'object') {
      return prop;
    }
    obj = prop;
  }

  return null;
}

function Strategy(o) {
  var opts = o || {};
  var self = this;
  self._usernameField = opts.usernameField || 'username';
  self._passwordField = opts.passwordField || 'password';
  var appId = opts.appId || process.env['B4A_APP_ID'] || '';
  var jsKey = opts.jsKey || process.env['B4A_JS_KEY'] || '';
  //var masterKey = opts.masterKey || process.env['MASTER_KEY'] || "";

  if (opts.parseClient) {
    self.parseClient = opts.parseClient;
  } else {
    self.parseClient = parse.initialize(appId, jsKey);
  }

  if (opts.parseUser) {
    self.parseUser = opts.parseUser;
  } else {
    self.parseUser = new self.parseClient.User();
  }

  self.serializeUser = function(user, done) {
    done(null, user);
  };

  self.deserializeUser = function(user, done) {
    done(null, user);
  };

  this.name = 'parse';

  return this;
}

Strategy.prototype.authenticate = async function(req, options = {}, next) {
  console.log(options, next )
  try {
    var self = this;
    var username = lookup(req.body, this._usernameField) || lookup(req.query, this._usernameField);
    var password = lookup(req.body, this._passwordField) || lookup(req.query, this._passwordField);
    var data = { username: username, password: password };
    if (!username || !password) {
      console.log('check1')
      return self.fail({ message: options.badRequestMessage || 'Missing credentials' }, 400);
    } 
    console.log('ajskafhsjkhkh', next)
    const user = await self.parseClient.User.logIn(username, password);
    return self.success(user);
  } catch (e) {
    return self.success({err: e.message});
  }
};

module.exports = Strategy;
