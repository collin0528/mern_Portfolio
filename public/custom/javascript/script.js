/**
 * Register Functionality
 */
const Register = (function(){
    if(document.querySelector("#register-form")){
        const registerForm = document.querySelector("#register-form");


        registerForm.addEventListener("submit", async function(event){
            event.preventDefault();

            let form_errors = [];//empty errors array
            document.querySelector("#register-form-info").innerHTML = "";


            let firstname = this.firstname.value.trim();
            let lastname = this.lastname.value.trim();
            let email = this.email.value.trim();
            let password = this.password.value.trim();
            // let recaptcha = this.recaptcha;

            let password_confirm = this.password_confirm.value.trim();

            if(firstname.length == 0){
                form_errors.push("You did not enter first name");
                document.querySelector("#register-form-info").innerHTML += `<div class='mb-3 alert alert-danger'>
                You did not enter first name
                </div>`;
            }

            if(lastname.length == 0){
                form_errors.push("You did not enter last name");
                document.querySelector("#register-form-info").innerHTML += `<div class='mb-3 alert alert-danger'>
                You did not enter last name
                </div>`;
            }

            if(email.length == 0){
                form_errors.push("You did not enter email");
                document.querySelector("#register-form-info").innerHTML += `<div class='mb-3 alert alert-danger'>
                You did not enter email
                </div>`;
            }

            if(password.length == 0){
                form_errors.push("You did not enter password");
                document.querySelector("#register-form-info").innerHTML += `<div class='mb-3 alert alert-danger'>
                You did not enter password
                </div>`;
            }

            if(password_confirm.length == 0){
                form_errors.push("You did not confirm password");
                document.querySelector("#register-form-info").innerHTML += `<div class='mb-3 alert alert-danger'>
                You did not confirm password
                </div>`;
            }




            if(password != password_confirm){
                //output error
                form_errors.push("Password must match Password Confirmation");
                document.querySelector("#register-form-info").innerHTML += `<div class='mb-3 alert alert-danger'>
                                                                            Password must match Password Confirmation
                                                                        </div>`;

            }

            



            if(form_errors.length == 0){
                //start the spinner
                Spinners.startSpinner()

                //there are no errors
                const userdata = {
                    firstname: firstname,
                    lastname: lastname,
                    email: email,
                    password: password
                   
                }

                const feedback = await axios.post("/register-user", userdata)
                console.log(feedback);

                if(feedback){
                    //stop the spinner
                    Spinners.stopSpinner()

                    document.querySelector("#register-form-info").innerHTML = `<div class='alert alert-success'>
                        <h4>Your account was created successfully!</h4>
                        <p>We sent you a validation email. Please click the link to activate your account.</p><br>
                        <a href="https://mail.google.com/mail/u/0/?tab=rm#inbox">Click Here</a>
                        
                    </div>`

                    //clear the form field
                    // $("#register-form")[0].reset();
                    $("#register-form").html("<div></div>");
                }

                

            }



        })


    }


}())


const Reset = (function(){
    if(document.querySelector("#register-form1")){
        const registerForm = document.querySelector("#register-form1");


        registerForm.addEventListener("submit", async function(event){
            event.preventDefault();

            let form_errors = [];//empty errors array
            document.querySelector("#register-form-info1").innerHTML = "";


            let email1 = this.email1.value.trim();
           

            if(email1.length == 0){
                form_errors.push("You did not enter email");
                document.querySelector("#register-form-info1").innerHTML += `<div class='mb-3 alert alert-danger'>
                You did not enter email
                </div>`;
            }
        
            if(form_errors.length == 0){
                //start the spinner
                Spinners.startSpinner()

                //there are no errors
                const userdata = {
                    email1: email1,
                }

                const feedback = await axios.post("/reset-user", userdata)
                console.log(feedback);

                if(feedback){
                    //stop the spinner
                    Spinners.stopSpinner()

                    document.querySelector("#register-form-info1").innerHTML = `<div class='alert alert-success'>
                        <h4>Your request was successful</h4>
                        <p>We sent you a new password to your email. Please click the link to activate your account.</p><br>
                        <a href="https://mail.google.com/mail/u/0/?tab=rm#inbox">Click Here</a>
                        
                    </div>`

                    //clear the form field
                    // $("#register-form")[0].reset();
                    $("#register-form1").html("<div></div>");
                }

                

            }



        })


    }


}())


const Savenewpassword = (function(){
    if(document.querySelector("#reset-password-form")){
        const resetForm = document.querySelector("#reset-password-form");


        resetForm.addEventListener("submit", async function(event){
            event.preventDefault();

            let form_error = [];//empty errors array
            document.querySelector("#reset-password-form-info").innerHTML = "";


    
            let new_password = this.new_password.value.trim();

            let new_password_confirm = this.new_password_confirm.value.trim();


            if(new_password.length == 0){
                form_error.push("You did not enter password");
                document.querySelector("#reset-password-form-info").innerHTML += `<div class='mb-3 alert alert-danger'>
                You did not enter password
                </div>`;
            }

            if(new_password_confirm.length == 0){
                form_error.push("You did not confirm password");
                document.querySelector("#reset-password-form-info").innerHTML += `<div class='mb-3 alert alert-danger'>
                You did not confirm password
                </div>`;
            }




            if(new_password != new_password_confirm){
                //output error
                form_error.push("Password must match Password Confirmation");
                document.querySelector("#reset-password-form-info").innerHTML += `<div class='mb-3 alert alert-danger'>
                                                                            Password must match Password Confirmation
                                                                        </div>`;

            }

        



            if(form_error.length == 0){
                //start the spinner
                Spinners.startSpinner()

                // let params = new URLSearchParams('http://localhost:3000/password_reset_verify');
                // let email = params.get("email")
                let email = this.email.value;
                //there are no errors
                const newdata = {
                    email: email,
                    password: new_password
                   
                }

                
                // const feedback = await axios.post("/save-new-password", newdata)
                // console.log(feedback);

                axios.post('/save-new-password', newdata)
                  .then(function (response) {
                    console.log(response.data);
                    Spinners.stopSpinner()

                  })
                  .catch(function (error) {
                    console.log(error);
                    Spinners.stopSpinner()

                  });

                // if(feedback){
                    //stop the spinner
                    // Spinners.stopSpinner()

                    // document.querySelector("#reset-password-form-info").innerHTML = `<div class='alert alert-success'>
                    //     <h4>Your account was created successfully!</h4>
                    //     <p>We sent you a validation email. Please click the link to activate your account.</p><br>
                    //     <a href="https://mail.google.com/mail/u/0/?tab=rm#inbox">Click Here</a>
                        
                    // </div>`

                    //clear the form field
                    // $("#register-form")[0].reset();
                    // $("#reset-password-form-info").html("<div></div>");
                // }
                
                

                

            }



        })


    }


}())



/**
 * Login Functionality
 */
const Login = (function(){

        if(document.querySelector("#login-form")){
            const loginForm = document.querySelector("#login-form");

            loginForm.addEventListener("submit", async function(event){
                event.preventDefault();

                Spinners.startSpinner();

                let email = this.email.value.trim();
                let password = this.password.value.trim();
                

                //check to confirm the email/password
                const feedback = await axios.post("/check-user-details", { email: email, password: password });

                // if(recaptcha.clicked == true) {
                    
            

                
                if(feedback){
                    Spinners.stopSpinner();
                    console.log("Hey: ", feedback.data.code);
                    if(feedback.data.code == "valid-user"){
                        //login this user
                        Spinners.startSpinner();
                        const loginFeedback = await axios.post("/login-user", {email: email, password: password})

                        if(loginFeedback){
                            Spinners.stopSpinner();

                            if(loginFeedback.data.code == "authenticated"){
                                location.href = "/user";
                            }

                        }
                    }
                }


            })


        }



}())  



/**
 * Spinners Functionality
 */
 const Spinners = (function(){
    function startSpinner(){
        const modalCode = `<div class="modal" tabindex="-1" id='spinner-modal' data-backdrop='static' data-keyboard='false'>
        <div class="modal-dialog modal-dialog-centered border-0">
          <div class="modal-content border-0" style='background: transparent;'>
            <!-- <div class="modal-header border-0">
              <h5 class="modal-title">Please wait ...</h5>
            </div> -->
            <div class="modal-body border-0">
            <div class="spinner-border" role="status">
                <span class="sr-only">Loading...</span>
            </div>
            </div>
          </div>
        </div>
      </div>`
    
      let divElement = document.createElement("div");
      divElement.innerHTML = modalCode
    
      document.body.appendChild(divElement);
    
      $("#spinner-modal").modal('show');
    
    }


    function stopSpinner(){
        $("#spinner-modal").modal('hide');
    }


    return {
        startSpinner: startSpinner,
        stopSpinner: stopSpinner
    }
    

}())