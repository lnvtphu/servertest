var mongoose        = require('mongoose');
var connectDB       = require('../../connect_mongodb');
var Train           = require('./train_schema');
var Schema = mongoose.Schema;
  mongoose = connectDB.initialize(mongoose);
  module.exports = {


      /*
      * find train's information
      */

      infor: function(req, res){
        var _id = req.params._idTicket;
        Train.find({'coachs.seats.customer.ticket._id': _id}, function(err, cus) {
          if (cus <= 0) {
            res.json({Warrning :'Ticket ID is not already'});
          }
          else{
            var train =  cus[0];
                var coachs =  train.coachs;
                for(var i=0; i< coachs.length; i++){
                  var seats =  coachs[i].seats;
                  for(var j =0; j< seats.length; j++){
                    var cus =  seats[j].customer;
                    for(var k = 0; k< cus.length; k++){
                        if(cus[k].ticket._id == _id){
                          res.json(cus[k]);
                          // res.json({Success: 'Success'});
                      }
                    }
                  }
                }
          }
        })

      },

      /*
      * create train or coach
      */
      create: function(req, res){

        var customer = req.body;
        var state1 = false;
        var codeticket = new Date().getTime();

        customer.ticket.state = state1;
        customer.ticket._id = codeticket;
        // var date = new Date().getTime();
        var id_train = req.body.ticket._idTrain;
        var id_customer = req.body._id;
        Train.findById(id_train, function(err, train) {
          if (!train) {
            res.json({Warrning: 'Train not already'});
          }
          else{ 
              Train.find({'coachs.seats.customer._id': id_customer}, function(err, doc){
                if( doc.length > 0){                  
                  res.json({Warrning: 'You can not put two tickets at once'})
                }
                else{
                  var coachTrain = req.body.ticket.coachTrain;
                  var seatNumber = req.body.ticket.seatNumber;

                  train.coachs[coachTrain].seats[seatNumber].customer.push(customer);
                  train.save(function(err){
                    if (err) {
                      res.json({Warrning: "Faild!! Please try again"});
                    }

                    res.json({Success: "Successed! You should go our office to receive ticket early"});
                  })
                }
              });
            }
          });                
      },


      /*
      * update information train or coach
      */
      update: function(req, res){// update name put into idcus
        var id_cus = req.body._id;
        var name = req.body.name;
        if (!id_cus) {
          res.json('Warrning: Id customer is null, please type id!!')
        }else{
          Train.find({'coachs.seats.customer._id': id_cus}, function(err, trains){
            if (trains <= 0) {
             res.json('Warrning: No customer was found');
            }else{
              if (!name) {
                res.json('Warrning: Name is null, please type name!!');
              }else{
                var train =  trains[0];
                var coachs =  train.coachs;
                for(var i=0; i< coachs.length; i++){
                  var seats =  coachs[i].seats;
                  for(var j =0; j< seats.length; j++){
                  var cus =  seats[j].customer;
                    for(var k = 0; k< cus.length; k++){
                      if(cus[k]._id == id_cus){
                        cus[k].name = name;
                        train.save(function(err){
                          if(err)
                            res.json({Warrning: 'Update name customer faild'});
                        });
                        res.json({Success: 'Updated name customer successed'});
                        return;
                      }
                    }
                  }
                }
              }
            }
         });
      }
      },
      //
      ticket: function(req, res){// update ticket state put into id ticket
        var id_ticket = req.params._idTicket;
        var state = req.body.state;
        if (!id_ticket) {
          res.json('Warrning: Id ticket is null, please type id!!')
        }else{
          Train.find({'coachs.seats.customer.ticket._id': id_ticket}, function(err, ticket){
            if (ticket.length <= 0) {
             res.json('Warrning: No ticket was found');
            }else{
              if (!state) {
                res.json('Warrning: State is null, please update state!!');
              }else{
                // if (state != "true" || state != "false") {
                //   res.json({Warrning: 'Type data is erro. Please type True or False'});
                // }
                // else{
                var trains =  ticket[0];
                var coachs =  trains.coachs;
                for(var i= 0; i < coachs.length; i++){
                  var seats =  coachs[i].seats;
                  for(var j = 0; j< seats.length; j++){
                    var cus =  seats[j].customer;
                    for(var k = 0; k< cus.length; k++){
                        if(cus[k].ticket._id == id_ticket){
                         cus[k].ticket.state = state;
                          trains.save(function(err){
                          if(err)
                            res.json({Warrning : 'Type data is erro. Please type True or False'});
                        });
                        res.json({Success: 'Updated state successed'});
                        return;
                      }
                      
                        
                    }
                  }
                }
              // }
              }
            }
         });
      }
      },
      /*
      * delete
      */
      delete: function(req, res){
        var _id = req.body._id;
        Train.find({'coachs.seats.customer._id': _id}, function(err, doc) {
        if (doc.length <= 0) {
            res.json({Warrning:'No ID wa found'});
        } else {
          var trains =  doc[0];
          var coachs =  trains.coachs;
          for(var i = 0; i < coachs.length; i++){
            var seat =  coachs[i].seats;
            for(var j = 0; j < seat.length; j++){
              var cus =  seat[j].customer;
              var newarray = [];
              var t = 0;
              for(var k = 0; k < cus.length; k++){
                if(cus[k]._id != _id){
                    newarray[t] = cus[k];
                  t += 1;
                }
                trains.coachs[i].seats[j].customer = newarray;
              }

            }
          }
              //     custom.update({'cus[k]._id': _id}, { $pull: { customer: { 'cus[k]._id': _id }}}, { multi: true });
                 
                trains.save(function(err){
                  if (err) {
                      res.json({Warrning : 'Can not delete this ticket'});
                  }
                  res.json({Success: 'Deleted'});
                });
              // }  
            
          
        
      }
    });
  }
}
