var express = require('express');
var router = express.Router();


/* GET home page. */
router.get('/', function(req, res, next) {


  res.render('forgotlogin', 
  { 
    
    title: ' forgotlogin ',
    
});
});

module.exports = router;