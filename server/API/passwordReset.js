var
User            = require('./accounts').Account;
encryption      = require('./accounts').encryption,
//required node mailer
nodemailer      = require('nodemailer'),
smtpTransporter = nodemailer.createTransport('SMTP', {
  service: 'Gmail',
  auth: {
    user: "thetasplacements@gmail.com",
    pass: "angle2014"
  }
});


module.exports = function(app) {

  app.get('/sendmail/:id', function(req, res){ 
    var pw = Math.floor(Math.random()*90000000)+10000000;
    var email = req.params.id;
    User.findOne({ 'email': email.toLowerCase() }, function(err,doc){
      if(err){
        res.json(500,err);
        res.send("Error on DataBase!");  
      }else if(doc === null){
        res.send("The email specified does not exist.");  
      }else {
        var mailOptions = {
          from: "Placements <placements@gmail.com>",
          to: "<"+req.params.id+">",
        	subject: "Placements Account Password Reset",
        	text: "Greetings from Placement!\nYour new password is: "+ pw
        };

        smtpTransporter.sendMail(mailOptions, function(err){
          if(err) {
            this.smtpTransport.close();
            console.log (err);
            res.send(err);
        	}
        }.bind(this));
        //res.send(pw.toString());	

        doc.password = encryption.generateHash( pw.toString() );
        doc.save();
        res.json(200,doc);
        res.send("An email has been sent to "+email);  
      }
    });
  // end get  
  });

};