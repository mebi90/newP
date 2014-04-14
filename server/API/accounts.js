// Require mongoose to controll our mongoDB
var mongoose      	= require('mongoose'),
	bcrypt   		= require('bcrypt-nodejs'),
    Schema 	   		= mongoose.Schema,
    _ 		       	= require('underscore'),
    mongooseTypes 	= require("mongoose-types");
 
mongooseTypes.loadTypes(mongoose);

// create accountSchema
var accountSchema = mongoose.Schema({
	name	  		:   String,		// Name
	comName			:   String,		// Company Name
	phone			:   String,		// phone
	// For authentication
    email       	: String,		// Email
    password    	: String,		// password
});

// generating a hash (Password encryption)
accountSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid (Password decryption)
accountSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};

// Setup account Model
var Account = exports.Account = mongoose.model('Account', accountSchema);
var encryption = new Account();

// add an account to the database
var add = function(req, res){
	if(!req.body.name){
		res.json(400,{
			message: "Error! trying to add an account with no Name."
		});
	}else if(!req.body.email){
		res.json(400,{
			message: "Error! trying to add an account with no Email."
		});
	}else if(!req.body.password){
		res.json(400,{
			message: "Error! trying to add an account with no Password."
		});
	}else if(!req.body.comName){
		res.json(400,{
			message: "Error! trying to add an account with no comName."
		});
	}else{
		Account.create({
			name 			: req.body.name,	
			comName			: req.body.comName,	
			phone			: req.body.phone,	
	        email       	: req.body.email.toLowerCase(),		// Email
	        password    	: encryption.generateHash(req.body.password) // password
		},
		function(err,account){
			if(err){
				res.json(500,{
					message: 'Error!',
                    error: err
				});
			}else{
				res.json(201,account);
			}
		});
	}

};

// remove account from database
var remove = function(res, req){
	Account.findByIdAndRemove(req.params.id, function (err, account) {
		if(err){
			res.json(err);
		}else{
			res.json(account);
		}
	});
};

// return all elements.
var list = function(req, res){
	Account.find().exec(function(err, account){
		if(err){res.json(err);}
		else{res.json(account);}	
	});
};

// updates the element in the database.

var update = function(req,res){

	Account.findById(req.params.id, function(err,doc){
		if(err){
			res.json(500,err);
		}else{
			_.extend(doc, req.body);
			doc.password = encryption.generateHash(req.body.password);
			doc.save();
			res.json(200,doc);
		}
	});
};

// set Routes
exports.setup = function (app, auth) {
    app.get('/API/accounts', list);
    app.post('/API/accounts', add);
    app.put('/API/accounts/:id', auth, update);
    app.delete('/API/accounts/:id', auth, remove);
};








