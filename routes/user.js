var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  //res.send('respond with a resource');
  //check is the user is logged in 
  if(req.session.loginStatus){
    res.render('user', {
        firstname: req.session.loginStatus.firstname
    })
  }else{
    res.redirect("/login");
  }


  
});

module.exports = router;
