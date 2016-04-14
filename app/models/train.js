var mongoose        = require('mongoose');
var connectDB       = require('../../connect_mongodb');
var Train           = require('./train_schema');
  mongoose = connectDB.initialize(mongoose);

  module.exports = {
    /*
    */
    post: function (req, res){
      var addTrain        = req.body._id;
      var fromStation       = req.body.fromStation;
      var isAddTrain      = validateString(addTrain);
      var isFindTrain     = validateString(fromStation);
      if( isAddTrain && isFindTrain){
        res.status(500).json({"error":"DoNotDoThing"});
      }else if( isAddTrain ){
        createTrain(req, res);
      }else if( isFindTrain ){
        findTrain(req, res);
      }else {
        res.status(400).json({"error":"DoNotDoAnyThing"});
      }
    },

    delete: function(req, res){
      var idTrain         = req.body.idTrain;
      var numberCoach     = req.body.numberCoach;
      var isIdTrain       = validateString(idTrain);
      var isNumberCoach   = validateNumber(numberCoach);
      if( !isNumberCoach && isIdTrain ){
        deleteTrain(req, res);
      }else if(isIdTrain && isNumberCoach ){
        deleteCoach(req, res);
      }else{
        res.status(400).json({"error":"DoNotDoAnyThing"});
      }
    },

    put: function(req, res){
      var method    = req.body.method;
      var isMethod  = validateString(method);
      if( isMethod){
        switch (method) {
          case "swapJourney":
              swapJourney(req, res);
            break;
          case "edittrain":
              editTrain(req, res);
            break;
          case "blockcoach":
              blockCoach(req, res);
            break;
          case "editcoach":
              editCoach(req, res);
            break;
          case "blockseat":
              blockSeat(req, res);
            break;
          case "swapcoach":
              changeCoach(req, res);
            break;

          default:
            res.status(400).json({"error":"DoNotDoAnyThing"});
        }
      }
    },

      /*
      * GET
      */
      index: function(req, res){
        Train.find({}, function(err, listTrain){
            if(err)
              console.log(err);
            if(listTrain.length == 0){
              res.status(404).json({"error": "DataEmpty"});
              return;
            }
            res.json(listTrain);
        });
      },
      // find the train follow train's id
      findId: function(req, res){
        var idTrain     = req.params.idTrain;
        var isIdTrain   = validateString(idTrain);
        if(isIdTrain){
          Train.findById(idTrain, function(err, train){
              if(err)
                console.log(err);
              if(train == null){
                res.status(404).json({"error": "CannotFindTrain"});
                return;
              }
              res.json(train);
          });
        }else{
          res.status(400).json({"error":"InputError"});
        }
      },



    }

    /*
    * ============================
    * POST methods
    * ===================================
    */

    createTrain = function(req, res){
      var reqTrain    = req.body;
      var idTrain     = req.body._id;
      var isIdTrain   = validateString(idTrain);

      if(isIdTrain){
        Train.count({_id: idTrain}, function(err, count){
          if(err)
            console.log(err);
          if(count == 0){
            var train = new Train(reqTrain);
            train.save(function(err){
              console.log(err);
              res.send({"sucess": 'CreateSuccess'});
            });
          }else{
            res.status(400).send({"error": 'TrainExist'});
          }
        });
      }else {
        res.status(400).send({"error": 'InputError'});
      }
    };

    findTrain = function(req, res){
      var fromStation       = req.body.fromStation;
      var toStation         = req.body.toStation;
      var time              = req.body.time;
      var isFromStation     = validateString(fromStation);
      var isToStation       = validateString(toStation);
      var isTime            =  validateNumber(time);
      if( isFromStation && isToStation && isTime ){
            Train.find({}, function(err, trains){
              if(trains.length > 0 ){
                var listTrain = getListTrainByStation(trains, fromStation, toStation);
                console.log(listTrain);
                if(listTrain.length > 0){
                  var listTrainResult = [];
                  // convert timestamp to datetime
                  for(var i = 0; i < listTrain.length; i++){
                    // listTrain at the position odd is not object train's.
                    // It's value true or false to dectect the train is return or not return
                    if(i % 2 == 0 ){
                      // get time distance from two stations: startStation and endStation
                      var timeLong      = caculateFullJourney(listTrain[i]);
                      console.log(timeLong +" ============== timeLong");
                      // The Train's time begin run the first.
                      var startTime     = listTrain[i].timeStart;
                      //
                    //  console.log(Number(time) +" "+ Number(startTime));
                      var timeDistance  = Number(time) - Number(startTime);
                      // convert timestamp to datetime
                      var date          = new Date(timeDistance);
                      var day           = date.getDate();
                      console.log(day);
                      console.log((Number(day)*60*24)+ " " + Number(timeLong));
                      var collect       = (Number(day)*60*24) % (Number(timeLong));
                      console.log('div %:' +  collect);
                      console.log('return ' + listTrain[i+1]);
                      if( (collect >= timeLong/2) && (listTrain[i+1] == true) ){
                        listTrainResult.push(listTrain[i]);
                      }else if( (collect < timeLong/2) && listTrain[i+1] == false ){
                        listTrainResult.push(listTrain[i]);
                      }
                    }
                  }
                  // console.log(" train :" +listTrainResult.length + "=================\n");
                  if(listTrainResult.length == 0){
                    res.status(400).json({'error': 'CannotFindTrain'});
                  }else
                    res.json({listTrainResult});
              }else{
                res.status(400).json({"error": 'CannotFindTrain'});
              }

              //res.json(listTrain);
            }});
      }else {
        res.status(400).json({"error": 'InputError'});
      }
    };

    /*
    * ============================
    * DELETE methods
    * ===================================
    */
    deleteTrain = function(req, res){
      var idTrain   = req.body.idTrain;
      var isIdTrain = validateString(idTrain);
      if(isIdTrain){
          Train.remove({_id: idTrain}, function(err, docs){
            if(err)
              console.log(err);
              var writeResult = JSON.parse(docs);
              if(writeResult.n > 0)
                res.json({"succes": 'DeleteSuccess' });
              else
                res.status(400).json({"error": 'CannotFindTrain' });
          });
      }else{
        res.status(400).json({"error": 'InputError'});
      }
    };

    deleteCoach = function (req, res){
      var idTrain           =  req.body.idTrain;
      var numberCoach       =  req.body.numberCoach;
      var isIdTrain         = validateString(idTrain);
      var isNumberCoach     = validateNumber(numberCoach);
      if( isIdTrain && isNumberCoach){
        Train.findById(idTrain, function(err, train){
          if( null !== train){
            var listCoach = train.coachs;
            var listCoachNew = [];
            var j = 0;
            if(numberCoach >= listCoach.length){
              res.status(400).json({'error': 'NumberCoachError'});
              return;
            }
            for(var i = 0; i < listCoach.length; i++){
                 if( i  != numberCoach ){
                   listCoachNew[j] = listCoach[i];
                   j = j + 1;
                 }
              }
              train.coachs = listCoachNew;
              train.save(function(err){
                if(err)
                 console.log(err);
              });
              res.json({"success": 'DeleteSuccess'});
          }else{
             res.status(400).json({"error": 'CannotFindTrain'});
          }
          });

      }else{
        res.status(400).json({"error": 'InputError'});
      }
    };

    /*
    * ============================
    * PUT methods
    * ===================================
    */
    /*
    * update information train or coach
    */
    // change two coachs form two train.
    changeCoach = function(req, res){
      var idTrain1        = req.body.idTrain1;
      var idTrain2        = req.body.idTrain2;
      var numberCoach1    = req.body.numberCoach1;
      var numberCoach2    = req.body.numberCoach2;

      var isIdTrain1      = validateString(idTrain1);
      var isIdTrain2      = validateString(idTrain2);
      var isNumberCoach1  = validateNumber(numberCoach1);
      var isNumberCoach2  = validateNumber(numberCoach2);

      if( isIdTrain1 && isIdTrain2
              & isNumberCoach1 & isNumberCoach2){
        Train.findById(idTrain1, function(err, train1){
          if(err)
            console.log(err);
          if( train1 != null){
            Train.findById(idTrain2, function(err, train2){
              if(train2 !=  null ){
                if( ( numberCoach1 >= train1.coachs.length ) || ( numberCoach2 >= train2.coachs.length )){
                  res.status(400).json({"error": 'NumberCoachError.'});
                  return;
                }
                var listCoach1 =  train1.coachs;
                var listCoach2 =  train2.coachs;
                var coach1     = JSON.parse(JSON.stringify(listCoach1[numberCoach1]));
                // console.log(coach1 + "  " + coach2);
                // clone object
                listCoach1[numberCoach1] = JSON.parse(JSON.stringify(listCoach2[numberCoach2]));
                listCoach2[numberCoach2] = coach1;
                train1.coachs = listCoach1;
                train2.coachs = listCoach2;
                train1.save(function(err){
                  if(err)
                    console.log(err);
                });
                train2.save(function(err){
                  if(err)
                    console.log(err);
                });
                res.json({"success": ' ChangeSuccess'});
              }else{
                res.status(400).json({"error": ' CannotFindSecondTrain'});
              }
              });
            }else{
              res.status(400).json({"error": 'CannotFindFirstTrain'});
            }
        });
      }else{
        res.status(400).json({"error": 'InputError.'});
      }
    };
    // disable a seat of coach
    blockSeat = function(req, res){
      var idTrain         = req.body.idTrain;
      var numberCoach     = req.body.numberCoach;
      var numberSeat      = req.body.numberSeat;
      var isIdTrain       = validateString(idTrain);
      var isNumberCoach   = validateNumber(numberCoach);
      var isNumberSeat    = validateNumber(numberSeat);
      if( isIdTrain && isNumberCoach && isNumberSeat){
        Train.findById(idTrain, function(err, train){
          if(train  != null){
            if(numberCoach >= train.coachs.length){
              res.status(400).json({"error": 'NumberCoachError'});
              return;
            }
            if(numberSeat >= train.coachs[numberCoach].seats.length){
              res.status(400).json({"error": 'NumberSeatError'});
              return;
            }
            train.coachs[numberCoach].seats[numberSeat].state = false;
            // console.log(train.coachs[numberCoach].seats[numberSeat].state);
            // console.log(train.coachs[numberCoach].seats[numberSeat]);
            train.save(function(err){
              if(err)
                console.log(err);
                res.json({"success": 'BlockSuccess'});
            });
          }else{
              res.status(400).json({"error": 'CannotFindTrain'});
          }
        });
      }else{
          res.status(400).json({"error": 'InputError.'});
      }
    };
    // remove coach: This coach steal any a train. but it also exist in collection
    blockCoach = function(req, res){
      var idTrain           =  req.body.idTrain;
      var numberCoach       =  req.body.numberCoach;
      var isIdTrain         =  validateString(idTrain);
      var isNumberCoach     =  validateNumber(numberCoach);
      if(isIdTrain && isNumberCoach){
        Train.findById(idTrain, function(err, train){
          if(train != null){
            if(numberCoach > train.coachs.length){
              res.status(400).json({"error": 'NumberCoachError'});
              return;
            }
            for(var i = 0; i < train.coachs.length; i++){
               if( i  == numberCoach ){
                 train.coachs[i].state = false;
                 break;
               }
            }
            train.save(function(err){
              if(err)
               console.log(err);
            });
            res.json({"success": 'BlockSuccess'});
        }else{
          res.status(400).json({"error": 'CannotFindTrain'});
        }
        });
      }else{
        res.status(400).json({"error": 'InputError'});
      }
    };
   // edit typeCoach and price
    editCoach = function(req, res){
      var idTrain           = req.body.idTrain;
      var numberCoach       = req.body.numberCoach;
      var typeCoach         = req.body.typeCoach;
      var price             = req.body.price;
      var state             = req.body.state;

      var isIdTrain         = validateString(idTrain);
      var isNumberCoach     = validateNumber(numberCoach);
      var isTypeCoach       = validateString(typeCoach);
      var isPrice           = validateNumber(price);
      var isState           = validateString(state);

      if( isIdTrain && isNumberCoach
          && isTypeCoach && isPrice && isState){
          if( state == 'true' || state == 'false'){
            Train.findById(idTrain, function(err, train){
              if( null !== train){
                if( numberCoach >= train.coachs.length){
                  res.status(400).json({"error": 'NumberCoachFailed'});
                  return;
                }
                for(var i = 0; i < train.coachs.length; i++){
                   if( i  == numberCoach ){
                     train.coachs[i].typeCoach = typeCoach;
                     train.coachs[i].price = price;
                     train.coachs[i].state = state;
                     break;
                   }
                }
                train.save(function(err){
                  if(err)
                   console.log(err);
                });
                res.json({"success": 'UpdateSuccess'});
            }else{
              res.status(400).json({"error": 'CannotFindTrain'});
            }
            });
          }else{
            res.status(400).json({"error": 'SateError'});
          }
        }else{
          res.status(400).json({"error": 'InputError'});
        }
    };
    editTrain = function(req, res){
      var idTrain           = req.body.idTrain;
      var title             = req.body.title;
      var state             = req.body.state;
      var timeStart         = req.body.timeStart;
      var isIdTrain         = validateString(idTrain);
      var isTitle           = validateString(title);
      var isState            = validateString(state);
      var isTimeStart       = validateNumber(timeStart);
      if(isIdTrain && isTitle && isState && isTimeStart){
        Train.findById(idTrain, function(err, train){
          if(train != null){
            if( state == 'true' || state == 'false'){
              train.title       = title;
              train.state       = state;
              train.timeStart   = timeStart;
              train.save(function(err){
                if(err)
                  console.log(err);
                  res.json({"success": 'ChangeSuccess'});
              });
            }else{
              res.status(400).json({"error": 'SateError'});
            }

          }else{
            res.status(400).json({"error": 'CannotFindTrain'});
          }
        });
      }else {
        res.status(400).json({"error": 'InputError'});
      }
    };
    swapJourney = function(req, res){
      var idTrain1      = req.body.idTrain1;
      var idTrain2      = req.body.idTrain2;
      var isIdTrain1    = validateString(idTrain1);
      var isIdTrain2    = validateString(idTrain2);
      if(isIdTrain1 && isIdTrain2){
        Train.findById(idTrain1, function(err, train1){
          if(train1 !=  null){
            Train.findById(idTrain2, function(err, train2){
              if(train2 != null){
                var trainJourney1 = train1.trainJourney;
                var trainJourneyReturn1 = train1.trainJourneyReturn;
                train1.trainJourney = train2.trainJourney;
                train1.trainJourneyReturn = train2.trainJourneyReturn;
                train2.trainJourney = trainJourney1;
                train2.trainJourneyReturn = trainJourneyReturn1;
                train1.save(function(err){
                  if(err)
                    console.log(err);
                });
                train2.save(function(err){
                  if(err)
                    console.log(err);
                });
                res.json({"success": 'ChangeSuccess'})
              }else{
                  res.status(400).json({"error":'CannotFindSecondTrain'})
              }
            });
          }else{
              res.status(400).json({"error":'CannotFindFirstTrain'})
          }
        });
      }else{
        res.status(400).json({"error":'InputError'})
      }
    };

    /*
    * ============================
    * Validate input
    * ===================================
    */
    function validateString(str){
      if( 'undefined' == (typeof str))
        return false;
      if(str.length > 1){
        return true;
      }
      return false;

    }
    function validateNumber(number){
      if(Number(number) >= 0)
        return true;
      return false;
    }
    // caculate date for 1 Journey an Journeyreturn
    function caculateFullJourney(train){
      var journey             = train.trainJourney;
      var lenghtTrainJourney  = journey.length;
      var startTimeStation    = journey[0].time;
      var timeLong            = 0;
      var timeRest            = journey[0].time;
      // console.log(timeRest +" asdfs");
      for(var i = 1; i < lenghtTrainJourney; i++){
        var time = journey[i].time;
        if( time < startTimeStation ){// cross new date
          timeLong += ((24*60) - Number(startTimeStation) + Number(time));
        }else{ // don't cross new date
          timeLong += Number(time) - Number(startTimeStation);
        }
        startTimeStation = time;
      }
      var journeyReturn =  train.trainJourneyReturn;
      // time the train rest then bengin new journey
      var timeFullDay =  (24*60) - journeyReturn[journeyReturn.length-1].time;
      // total time forward and return
      // console.log( timeRest + " " + timeLong*2 + ' '  +timeFullDay + '\n');
      timeLong = Number(timeRest) + Number(timeLong*2) + Number(timeFullDay);
      // console.log(timeLong+ "res"/);
      return timeLong;
    }
    // delect list of the train by fromStation and toStation
    function getListTrainByStation(trains, fromStation, toStation){
          // dectect the train heave journey.
          var listTrain = [];
        for( var i = 0; i <  trains.length; i++){
          var isDistance  = false;
          var isToStation = false;
          var isReturn = false;
          var trainJourney =  trains[i].trainJourney;
          for(var j = 0; j < trainJourney.length; j++){
              if( !isToStation && (trainJourney[j].station == fromStation)){
                  // console.log(trains[i]._id + " " + fromStation + ' from Not return');
                  isToStation =  true;
              }
              if( isToStation && (trainJourney[j].station == toStation)){
                isDistance = true;
                // console.log(trains[i]._id + " " + toStation+' to  Not return');
                break;
            }
            }
            // if trainJourney didn't have Distance then find in trainJourneyReturn
          if(!isDistance){
            isToStation = false;
            var trainJourneyReturn =  trains[i].trainJourneyReturn;
            for(var j = 0; j < trainJourneyReturn.length; j++){
              if( !isToStation && (trainJourneyReturn[j].station == fromStation)){
                  isToStation =  true;
                  // console.log(trains[i]._id + " " + fromStation +' from return');
              }
              if( isToStation && (trainJourneyReturn[j].station == toStation)){
                isDistance = true;
                isReturn   = true;
                  // console.log(trains[i]._id + " " + toStation +' to return');
                break;
              }
          }
        }
          if(isDistance)  {
            listTrain.push(trains[i]);
            listTrain.push(isReturn);
          }
        }
        // console.log(listTrain);
        return listTrain;
    }
