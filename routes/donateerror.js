var express = require('express');
// const { auth, requiresAuth } = require("express-openid-connect");
var router = express.Router();


router.get('/', function(req, res, next) {
  
  
    res.render('donateerror', 
    { 
      
      title: 'could not complete transaction ',
      
  });
  });
  
  module.exports = router;