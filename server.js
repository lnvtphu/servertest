
var express       = require('express');
var app           = express();
var config        = require('./configure');
var Router        = express.Router();
var routes        = require('./router');
var port          = process.env.PORT || 8080;
// configure
  app             = config(app);
  routes.initialize(app, Router);

  app.listen(port);
  console.log('Server is running at ' + port);
