
module.exports.initialize = function(mongoose){
  mongoose = mongoose.createConnection('mongodb://admin:123456@ds011870.mlab.com:11870/traintickets');
  return mongoose;
}
