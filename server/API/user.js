// load the things we need
var mongoose 		= require('mongoose'),
    bcrypt   		= require('bcrypt-nodejs'),
    _ 		       	= require('underscore'),		
  	mongooseTypes 	= require("mongoose-types");

// define the schema for our user model
var userSchema = mongoose.Schema({
    local            : {
        email        : String,
        password     : String,
    }
});

// generating a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);
