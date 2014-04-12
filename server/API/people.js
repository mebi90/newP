/*
	A collection in the mongodb placements called people will be made.
	It will hold info on people which are the potential candidates recruiters
	will review to see fit in a company. 

	A person resembles one of the objects stored in the people collection. It has 
	a first name, last name, email, phone number, company name, and a job title.

	A recruiter can add, delete, view, search, and organize their list of people into
	sets.

	This file will contain the code for allowing recruiters to interface with their lists
	of people in the database. 

*/

// Require mongoose to controll our mongoDB
var  mongoose      = require('mongoose')
  ,  Schema 	   = mongoose.Schema
  ,  _ 		       = require('underscore')		// use underscore lib
  ,  mongooseTypes = require("mongoose-types");
 
mongooseTypes.loadTypes(mongoose);

// Setup Person Model
var Person = mongoose.model('Person', {
	name	  	:   String,		// Person's Name
	email		:   String,		// Person's Email address
	phoneNum	:   String,		// Person's Phone number
	comName		:   String,		// Person's Company Name
	jobTit		:   String		// Person's Job title
});

// add a person to the people collection in the database placements
var addperson = function(req, res){
	console.log("Hello world");
	// Make sure the requester put a name for the person they 
	// are adding to the database.
	if(!req.body.name){
		console.log(req.body.name);
		res.json(400,{
			message: "Error! trying to add an account with no Name."
		});
	// Make sure the requester put a email for the person they 
	// are adding to the database.
	}else if(!req.body.email){
		res.json(400,{
			message: "Error! trying to add an account with no Email."
		});
	}else{
	// When a requester has put all the required fields for a person to add
	// then we will create that person and add it to the people collection.
		Person.create({
			name 		: req.body.name 	,	
			email 		: req.body.email 	,	
			phoneNum	: req.body.phoneNum,
			comName		: req.body.companyName	,	
			jobTit		: req.body.jobTit		
		},
		function(err,person){
			if(err){
				res.json(500,{
					message: 'Error!',
                    			error: err
				});
			}else{
				res.json(201,person);
			}
		});
	}
};

// return all the people.
var list = function(req, res){
	Person.find().exec(function(err, person){
		if(err){res.json(err);}
		else{res.json(person);}	
	});
};

// Connects the app to people api to interface with people methods.
exports.setup = function(app){
	app.get('/API/people', list);
	app.post('/API/people', addperson);
};

		
