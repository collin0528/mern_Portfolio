var express = require('express');
// const { auth, requiresAuth } = require("express-openid-connect");
var router = express.Router();


router.get('/', function(req, res, next) {
  
  
    res.render('donatesuccess', 
    { 
      
      title: 'you have successfully donated ',
      
  });
  });
  
  module.exports = router;