// Prepare Strategy
var LocalStrategy    = require('passport-local').Strategy,
    User = require('./API/accounts').Account;

module.exports = function(passport) {
//==================================================================
// Define the strategy to be used by PassportJS
  passport.use(new LocalStrategy(
    function(email, password, done) {
      User.findOne({ 'email' :  email }, function(err, user) {
        // if there are any errors, return the error
        if (err)
          return done(err);
        if(!user)
          return done(null, false, { message: 'Incorrect username.' });
        if(!user.validPassword(password))
          return done(null, false, { message: 'Oops! Wrong password.' });

        // ALL FINE return User.
        return done(null, user);
      });
    }
  ));

  // Serialized and deserialized methods when got from session
  passport.serializeUser(function(user, done) {
      done(null, user);
  });

  passport.deserializeUser(function(user, done) {
      done(null, user);
  });

  // Define a middleware function to be used for every secured routes
  auth = function(req, res, next){
    if (!req.isAuthenticated()) 
      res.send(401);
    else
      next();
  };
//==================================================================
};

