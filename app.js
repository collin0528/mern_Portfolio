var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
const bcryptjs = require("bcryptjs");
 require("dotenv").config(); //bring in the dotenv package.
const { authConfig, databaseConfig, mailConfig } = require("./engine/config");
var logger = require('morgan');
const nodemailer = require("nodemailer");
const mongodb = require("mongodb");
const session = require("express-session");
//const stripe=require('stripe')('stripe_api_key'); 
const mongodbSession = require("connect-mongodb-session")(session);
 const crypto = require("crypto");
 const Joi = require("joi");
 const createPasswordResetToken = require('./services/functions');
 const paypal = require('paypal-rest-sdk');
 const FormData = require('form-data');
 const fs = require('fs');
 const axios = require('axios');

 


//create the mongodb client
const MongoClient = mongodb.MongoClient;

// const client = new MongoClient("mongodb+srv://cyclobold_user:e6b5eBt.$5PAcgx@cluster0.qcoqo.mongodb.net/?retryWrites=true&w=majority")
//const client = new MongoClient("mongodb+srv://collins:emekus0528@cluster0.qjmfa.mongodb.net/?retryWrites=true&w=majority")
const client = new MongoClient(databaseConfig.uri)
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const registerRouter = require("./routes/register")
const loginRouter = require("./routes/login");
const logoutRouter = require("./routes/logout");
const userRouter = require("./routes/user");
const forgotloginRouter = require("./routes/forgotlogin");
const donateRouter = require("./routes/donate");
const donatesuccessRouter = require("./routes/donatesuccess");
const donateerrorRouter = require("./routes/donateerror");
const checkresetRouter = require("./routes/checkreset");


var app = express();

const mongodbSessionStore = new mongodbSession({
  uri: databaseConfig.uri,
  databaseName: "broomsticks-sessions",
  collection: "broomsticks-sessions"
})

// paypal.configure({ 
//   mode: donationConfig.Mode,
//   client_id: donationConfig.client_id,
//   client_secret:donationConfig.client_secret
// });
paypal.configure({
  'mode': 'sandbox', //sandbox or live 
  'client_id': 'AcbNBNHRjWc24ixdYHQ70dJ5GoI9ax9KbrH1QojTbyojIGdUfAxxXFEqqN-BV8pA8XZw-NPYSdMtZfjR',
  'client_secret': 'EPMX8WIP0gJ7TbgPbj0dC9NQrJHoE3npkfw2PPJF8v444I67M61vz-rm9IWpvEDGDOUHSWzYRwEe1GXx'
});


//bring in the session
app.use(session({
  secret: authConfig.secret,
  resave: false,
  saveUninitialized: false,
  store: mongodbSessionStore

}))

// let’s you use the cookieParser in your application
app.use(cookieParser());





app.use(express.json());

//a get route for adding a cookie
app.get('/setcookie', (req, res) => {
  res.cookie(`Cookie token name`,`encrypted cookie string Value`);
  res.send('Cookie have been saved successfully');
});





// get the cookie incoming request
app.get('/getcookie', (req, res) => {
  //show the saved cookies
  console.log(req.cookies)
  res.send(req.cookies);
});


//a get route for adding a cookie
app.get('/setcookie', (req, res) => {
  res.cookie(`Cookie token name`,`encrypted cookie string Value`,{
      maxAge: 5000,
      // expires works the same as the maxAge
      expires: new Date('01 12 2023'),
      secure: true,
      httpOnly: true,
      sameSite: 'lax'
  });
  res.send('Cookie have been saved successfully');
});



//Email Setup
var transporter = nodemailer.createTransport({
  service: mailConfig.service,
  auth: {
    user: mailConfig.user,
    pass: mailConfig.password
  }
});

//functions
const internally_check_user_exists = async (email, password) => {

  console.log("Checking Password: ", password);

  const feedback = await client.db(databaseConfig.dbname).collection("users").findOne({ "email": email });

  if(feedback){
    //compare with the email address
    const isMatchedPassword = await bcryptjs.compare(password, feedback.password);

    if(isMatchedPassword){
      return {
        message: "user is valid",
        code: "valid-user",
        data: { email: feedback.email , firstname: feedback.firstname, lastname: feedback.lastname }
      }

    }else{
      return{
        message: "user is invalid",
        code: "invalid-user",
        data: null
  
      }
    }



  }else{
    return{
      message: "user is invalid",
      code: "invalid-user",
      data: null

    }
  }


}

app.post("/logout", function(req, res){
  //logout the user 
  req.session.destroy(function(error){
    if(error) throw error;

    res.redirect("/login");

  })


})


//Endpoints



//Login User
app.post("/login-user", async function(request, response){

  const {email, password } = request.body;


  //check the user again ..,
  const feedback = await internally_check_user_exists(email, password);

  console.log("checks: ", feedback)
  if(feedback){
    if(feedback.code == "valid-user"){
      request.session.loginStatus = {
        "is_user_logged_in": true,
        "email": feedback.data.email,
        "firstname" : feedback.data.firstname,
        "lastname": feedback.data.lastname 
    }

     //redirect
     response.send({
      message: "user logged in successfully",
      code: "authenticated",
      data: {}
    })

  }else{

    response.send({
      message: "invalid email/password combination",
      code: "not-authenticated",
      data: {}
    })


  }

  }

 

 



})



//Register User
app.post("/register-user", async function(request, response){
    const firstname = request.body.firstname
    const lastname = request.body.lastname
    const email = request.body.email
    const password = request.body.password

    //hash the password
    let hashedPassword = await bcryptjs.hash(password, 12);


    const email_link = `http://localhost:3000/verify_account?email=${email}&&key=123`;

    //send email to this user
    const mailOptions =  {
      from: 'collinsndukwe28@gmail.com',
      to: email,
      subject: `Activate Your Account`,
      html: `<body>
                  <h3>Congratulations.</h3>
                  <hr>
                  Your account has been created. Please verify by clicking the link 
                  below: <br>
                  <a target='_blank' href='${email_link}'>${email_link}</a>
          </body>`
    };

    transporter.sendMail(mailOptions, async function(error, info){
      if (error) {
          console.log(error);
          throw error
        } else {
          console.log('Email sent: ' + info.response);

          //save to database
          const feedback = await client.db("broomsticks").collection("users").insertOne({
            firstname: firstname,
            lastname: lastname,
            email: email,
            password: hashedPassword,
            key: 123,
            is_user_verified: false

          })
          
          if(feedback){
            //emai sent
            response.send("Email was sent to "+email)
          }
          
  
        
        }
  
  
    })
    
})


//Register new-password
app.post("/save-new-password", async function(request, response){


  console.log("backend save new assword end oint")
    
 
     const email = request.body.email;
    const password = request.body.password
      console.log(email)
    //hash the password
    let hashedPassword = await bcryptjs.hash(password, 12);

     try {
       //save to database
       const feedback = await client.db('broomsticks').collection('users').updateOne({"email": email }, {$set: {'password': hashedPassword }}) 
      //  const feedback = await client.db("broomsticks").collection("users").updateOne({
   
      //   password: hashedPassword
      // "isTokenVerified": true

      // })
      if(feedback){
        response.send("account-verified");
    }
      
     } catch (error) {
      
      //there is an error 
      //console.log(error.message)
      console.log('Something unexpected just happened ');
     }


    
})



app.post("/check-user-details", async function(request, response){

  const email = request.body.email;
  const password = request.body.password;

  const feedback = await client.db(databaseConfig.dbname).collection("users").findOne({ "email": email });

  if(feedback){
      //this user is a valid user..
      const isPasswordMatched = await bcryptjs.compare(password, feedback.password);
      if(isPasswordMatched){
        response.send({
          message: "user is valid",
          code: "valid-user",
          data: { email: feedback.email , firstname: feedback.firstname, lastname: feedback.lastname }
        })
      }else{
        response.send({
          message: "user is invalid",
          code: "invalid-user",
          data: null
        })
      }

  }else{

    response.send({
      message: "user is invalid",
      code: "invalid-user",
      data: null

    })

  }
  

})

app.get('/password_reset_verify',  async function(request, response){

  //get the token 
  const token = request.query.generatedToken;

  //get the user's email
  const email = request.query.email;

  //check if the token and email are correct
  try{
    const feedback = await client.db('broomsticks').collection('reset-tokens').findOne({'email1': email });
    if(feedback){
        //check if the token has been used already
        if(feedback.isTokenVerified === true){
            //the token has been verified already
            response.render("error", {
              message: "Your link is invalid",
              error: {
                stack: "The token has been used already",
                status: 402
              }
            });
        }else{
            //the token has not been verified.. 
            //update the token 
            const updateTokenFeedback = await client.db('broomsticks').collection('reset-tokens').updateOne({"email1": email }, {$set: {"isTokenVerified": true }})

            //the token has been updated 
            //show the page where they can change their password
            response.render('checkreset', {
              'email': email
            } );
        }  

    }else{
      //the user with that email address does not exist
      response.render("error", {
        message: "Your link is invalid",
        error: {
          stack: "A user with that email does not exist",
          status: 402
        }
      });
    }

  }catch(error){
      //there is an error 
      //console.log(error.message)
      console.log('Something unexpected just happened ');
  }

 
  

})

app.get("/verify_account", async function(request, response){

  //console.log(request.query);
  let email = request.query.email;
  let key = request.query.key;

  //check the database to see if the query data matches
  //check if email exists
  const feedback = await client.db("broomsticks").collection("users").findOne({'email': email})

  console.log(feedback);

  if(feedback != null){
    //the email exists
    //check the key
    console.log(feedback);

    if(feedback.key == key ){
      
      //check if this user has been verified already..
      const verified = await client.db("broomsticks").collection("users").findOne({"is_user_verified": true});
      if(verified){
        response.render("account-verified-already-status");
      }else{
          //if not verified
        const updateFeedback = await client.db("broomsticks").collection("users").updateOne({"email": email}, {$set: {"is_user_verified": true }})

        console.log(updateFeedback);
        if(updateFeedback){
          response.send("account-verified");
      }
      }

    



      
    
    }else{
      response.render("error", {
        message: "Your link is invalid",
        error: {
          stack: "The problem is the key",
          status: 402
        }
      });
    }

    
  }else{
    response.render("error", {
      message: "Your link is invalid", 
      error: {
        stack: "The problem is the email",
        status: 402
      }
    });
  }


  

})



app.post("/reset-user", async function(request, response){
    console.log('Reset user: ', request.body)
    const userEmail = request.body.email1;


    //send an email to the user to click on a password reset link
    //you are goingto be using Nodemailer
    
    //Create password reset token.. 
    //Save that token to the database 

    const token = await createPasswordResetToken();

    console.log(token);

    //save the token to database
    const feedback = await client.db('broomsticks').collection('reset-tokens').findOne({ 'email1': userEmail });

    if(feedback ){
      //a user already exists in the reset-tokens collection 
      const updateFeedback = await client.db('broomsticks').collection('reset-tokens').updateOne({'email1': userEmail }, { $set: {
        token: token,
        isTokenVerified: false
      } })

      if(updateFeedback){
            //  Prepare the link
            const email_link = `http://localhost:3000/password_reset_verify?email=${userEmail}&&generatedToken=${token}`;
            
            
            //send the email ...

            const mailOptions =  {
              from: 'collinsndukwe28@gmail.com',
              to: userEmail,
              subject: `Hello your request to change your password was successful`,
              html: `<body>
                          <hr>
                          You requested to change your password. Please click the link 
                          below to change your password: <br>
                          <a target='_blank' href='${email_link}'>${email_link}</a>
                  </body>`
            };

            transporter.sendMail(mailOptions, async function(error, info){
              if (error) {
                  console.log(error);
                  throw error
                } else {
                  console.log('Email sent: ' + info.response);
        
                  
                  if(feedback){
                    //emai sent
                    response.send("Email was sent to "+ userEmail)
                  }
                  
          
                
                }
          
          
            })

      }
    }

  
  

})


// start payment process 
app.get('/buy' , ( req , res ) => {
  var payment = {
          "intent": "authorize",
"payer": {
  "payment_method": "paypal"
},
"redirect_urls": {
  "return_url": "http://127.0.0.1:3000/success",
  "cancel_url": "http://127.0.0.1:3000/err"
},
"transactions": [{
  "amount": {
   "total": 7.00,
    "currency": "USD"
  },
  "description": " a donation to support the author Collins Ndukwe pHreshcode "
}]
  }
  createPay( payment ) 
      .then( ( transaction ) => {
          var id = transaction.id; 
          var links = transaction.links;
          var counter = links.length; 
          while( counter -- ) {
              if ( links[counter].method == 'REDIRECT') {
                  return res.redirect( links[counter].href )
              }
          }
      })
      .catch( ( err ) => { 
          console.log( err ); 
          res.redirect('/donateerror');
      });
}); 


app.get('/success' , (req ,res ) => {
  console.log(req.query); 
  res.redirect('/donatesuccess'); 
})

app.get('/donateerr' , (req , res) => {
  console.log(req.query); 
  res.redirect('/donateerr'); 
})


// helper functions 
var createPay = ( payment ) => {
  return new Promise( ( resolve , reject ) => {
      paypal.payment.create( payment , function( err , payment ) {
       if ( err ) {
           reject(err); 
       }
      else {
          resolve(payment); 
      }
      }); 
  });
}




// const inputPath = '/path/to/file.jpg';
// const formData = new FormData();
// formData.append('size', 'auto');
// formData.append('image_file', fs.createReadStream(inputPath), path.basename(inputPath));

// axios({
//   method: 'post',
//   url: 'https://api.remove.bg/v1.0/removebg',
//   data: formData,
//   responseType: 'arraybuffer',
//   headers: {
//             ...formData.getHeaders(),
//     'X-Api-Key': 'Sns8twLcvnjixfWGpXVrW8yc',
//   },
//   encoding: null
// })
// .then((response) => {
//   if(response.status != 200) return console.error('Error:', response.status, response.statusText);
//   fs.writeFileSync("no-bg.png", response.data);
// })
// .catch((error) => {
//     return console.error('Request failed:', error);
// });





// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use("/register", registerRouter);
app.use("/login", loginRouter);
app.use("/logout", logoutRouter);
app.use("/user", userRouter); //the user's dashboard
app.use("/paysuccess", userRouter);
app.use("/forgotlogin", forgotloginRouter);
app.use("/donate", donateRouter);
app.use("/donatesuccess", donatesuccessRouter);
app.use("/donateerror", donateerrorRouter);
app.use("/checkreset", checkresetRouter);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
