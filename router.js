
// models
var admin          = require('./app/models/admin');
var customer       = require('./app/models/customer');
var train          = require('./app/models/train');
var eventTrain     = require('./app/models/eventtrain');


module.exports.initialize = function(app, router){
  // router.use: always call when access website
  router.use(function(req, res, next){
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    var url = req.url;
    if( url.length == 1){ // only contain symboy '/'
      res.json({message:'hello! Welcom to website traintickets'});
    }else{
      // next the other router
      next();
    }
  });

  router.get('/train', train.index);
  router.get('/train/:idTrain', train.findId);
  router.get('/eventtrain', eventTrain.viewall);

  router.post('/train', train.post);
  router.post('/admin',admin.login);
  router.post('/eventtrain', eventTrain.create);
  router.post('/customer/:_idTicket', customer.infor);
  router.post('/customer', customer.create);

  router.delete('/train', train.delete);
  router.post('/eventtrain/delete', eventTrain.delete);
  router.delete('/customer', customer.delete);

  router.put('/admin',admin.changePassword);
  router.put('/train', train.put);
  router.put('/customer', customer.update);
  router.put('/customer/:_idTicket', customer.ticket);
  router.put('/eventtrain', eventTrain.update);


  app.use('/', router);
  console.log('Router Oke');
}
