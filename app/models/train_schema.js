var mongoose        = require('mongoose');
var connectDB         = require('../../connect_mongodb');
var Schema          = mongoose.Schema;

mongoose = connectDB.initialize(mongoose);

var Train = new Schema({
   "_id"   : String,
   "title" : String,
   "state" : Boolean,
   "timeStart": String,
   "coachs":[
     {
       "_id": String,
       "typeCoach"   : String,
       "seatNumber"  : Number,
       "price": Number,
       "state": Boolean,
       "seats":[{
         "number"  : Number,
         "state" : Boolean,
         "customer":[
           {
             "_id"     : Number,
             "name"    : String,
             "address" : String,
             "phone"   : String,
             "email"   : String,
             "company": {
               "nameCompany"     : String,
               "taxNumber"       : String,
               "addressCompany"  : String
             },
             "ticket": {
               "_id"         : Number,
               "_idTrain"    : String,
               "coachTrain"  : Number,
               "date"        : String,
               "seatNumber"  : Number,
               "nameTrain"   : String,
               "typeSeat"    : String,
               "isReturn"    : Boolean,
               "startStation": String,
               "endStation"  : String,
               "price"       : Number,
               "state"       : Boolean
             }
           }
         ]
       }]
     }
   ],
   "pricesDistance":[
     {
       "fromStation" : String,
       "toStation"   : String,
       "price"       : Number
     }
   ],
   "trainJourney":[
     {
       "station" : String,
       "time"    : String
     }
   ],
   "trainJourneyReturn":[
     {
       "station" : String,
       "time"    : String
     }
   ]
});

module.exports = mongoose.model('Train', Train);
