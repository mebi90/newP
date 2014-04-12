// set up ======================================================================
var //server
	express  = require('express'),
	http 	 = require('http'),
    path 	 = require('path'),
	port     = process.env.PORT || 3000,
	//Underscore
	_ 		 = require('underscore'),
	//DB
	mongoose = require('mongoose'),
	// load API ================================================================
	accounts = require('./server/API/accounts'),
	//passport
	passport = require('passport'),
	// app
	app      = express();


// configuration ===============================================================
mongoose.connect('mongodb://localhost:27017/test'); 

// load out passport settings 
require('./server/passport')(passport); 

// Define a middleware function to be used for every secured routes
var auth = function(req, res, next){
if (!req.isAuthenticated()) 
  res.send(401);
else
  next();
};
//==============================================================================

app.configure(function() {
	
	app.use(express.logger('dev')); 
  	app.use(express.cookieParser('keyboard cat'));
  	app.use(express.session({ cookie: { maxAge: 60000 }}));
	app.use(express.json());
	app.use(express.urlencoded());
	app.set('view engine', 'ejs'); 
	app.set('views', path.join(__dirname, './client/views'));
	app.use(express.static(path.join(__dirname, 'client')));
	app.use(express.session({ secret: 'placementsSecret' })); 
	app.use(passport.initialize());
	app.use(passport.session());
	app.use(app.router);
});

// routes ======================================================================
require('./server/routes.js')(app, passport); 

//install API
accounts.setup(app, auth);


// Check DB connection.=========================================================
var db = mongoose.connection; 
db.on('error', console.error.bind(console, 'db connection error:'));
db.once('open', function() {
	console.log('\nPlacements Port : 3000 ');
  	console.log('Database Port   : 27017 ');
  	console.log('Database connection successful.');
  	console.log('===============================\n');
});

// launch ======================================================================
app.listen(port);

exports.app = app;