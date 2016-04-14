var mongoose        = require('mongoose');
var connectDB       = require('../../connect_mongodb');
var Schema   = mongoose.Schema;
mongoose = connectDB.initialize(mongoose);

var AdminModel = new Schema({
    _id: String,
    name: String,
	password: String,
	level: Number
});



var Admin = mongoose.model('Admin', AdminModel);
module.exports = {

    login: function(req, res){
        var name = req.body.name;
        var pass = req.body.pass;
        var admincheck = Admin.findOne({
            name: name
        });
        admincheck.exec(function(err,adm){
            if(err)
                res.json(err);
            if(!adm){
                res.status(400).json({Error: 'Uername Is Incorrect'});
            }else if(pass != adm.password){
                 res.status(400).json({Error: 'Password Is Incorrect'});
            }else{
                adm.password = "";
                res.status(200).json(adm);
            }
        });
    },
    changePassword: function(req, res){
        var oldpass = req.body.oldpass;
        var newpass = req.body.newpass;
        var name = req.body.name;
        if(!name || !oldpass || !newpass){
            res.status(400).json({Error: 'Input Not Enough'});
            return;
        }
        Admin.findOneAndUpdate(
            { name: name, password:oldpass},
            {$set:{password:newpass}},
            {new : true},
            function(err, adm){
                if(err){
                    res.status(400).json(err);
                }else if(!adm){
                    res.status(400).json({Error: 'Update False'});
                }else{
                    res.status(200).json({Success:'Update Success'});
                }
            }
        );
    }
}
