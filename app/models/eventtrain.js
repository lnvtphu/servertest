var mongoose        = require('mongoose');
var connectDB       = require('../../connect_mongodb');
var Schema          = mongoose.Schema;
mongoose = connectDB.initialize(mongoose);

  //constructor
  var EventModel = new Schema({
      _id: String,
      name: String,
      objects: [
      ],
      timeBegin: String,
      timeEnd: String,
      image: String,
      content: String
  });
  var Event = mongoose.model('Event', EventModel);

module.exports = {
      viewall: function(req, res){
          var eventnew = Event.find({}).sort({_id: 1});
          eventnew.exec(function(err, st){
              console.log(err);
              if(st.length == 0){
                  res.status(400).json({Message: 'DataEmpty'});
              }
              res.status(200).json(st);
          });
      },

      /*
      * create train or coach
      */
      create: function(req, res){
          var reqEvent = req.body;
          var idEvent = req.body._id;
          if(!idEvent){
              res.status(400).json({Error: 'Input Not Enough'});
              return;
          }
          Event.count({_id: idEvent}, function(err, count){
              if(err){
                   res.status(400).json(err);
              }
              if(count == 0){
                  var event = new Event(reqEvent);
                  event.save(function(err){
                      res.status(200).json({"Sucess": 'CreateSuccess'});
                  });
              }else{
                  res.status(400).json({"Error": 'TrainExist'});
              }
          });
      },
      /*
      * update information train or coach
      */
      update: function(req, res){
          var reqEvent = req.body;
          var idEvent = req.body._id;

          if(!idEvent){
              res.status(400).json({Error: 'Input Not Enough'});
              return;
          }
          Event.findOneAndUpdate(
              {_id: idEvent},
              {
                $set:{
                    name: reqEvent.name,
                    objects: reqEvent.objects,
                    timeBegin: reqEvent.timeBegin,
                    timeEnd: reqEvent.timeEnd,
                    image: reqEvent.image,
                    content: reqEvent.content
                }
              },
              {new : true},
              function(err, evn){
                  if(err){
                      res.status(400).json(err);
                  }else if(!evn){
					var event = new Event(reqEvent);
					event.save(function(err){
						console.log(err);
						res.status(200).json({Success: 'CreateSuccess'});
					});
				  }else{
                      res.status(200).json({Success:'Update Success'});
                  }
              }
          );
      },

      /*
      * delete
      */
      delete: function(req, res){
          var id = req.body.id;
          Event.findOneAndRemove(
              {_id:id},
              function(err,evn){
                  if(err){
                      res.status(400).json(err);
                  }else if(!evn){
                      res.status(400).json({Error: 'Event With ID: ' + id + 'Not Exist'});
                  }else{
                      res.status(200).json({Success:'Delete Success'});
                  }
              }
          );
      }
  }
