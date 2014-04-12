// Prepare Strategy
var LocalStrategy    = require('passport-local').Strategy,
    User = require('./API/accounts').Account;

module.exports = function(passport) {
  //==============================================================================
  // PassportJS conf.
  // Define the strategy to be used by PassportJS
  passport.use(new LocalStrategy(
    function(user, pass, done) {
      var data = _.findWhere(User, {email: user.toLowerCase(), password: pass})
      if (data != undefined) 
        return done(null, data);

      return done(null, false, { message: 'Invalid User.' });
    }
  ));

  // Serialized and deserialized methods when got from session
  passport.serializeUser(function(user, done) {
      done(null, user);
  });

  passport.deserializeUser(function(user, done) {
      done(null, user);
  });
};

