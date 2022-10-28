/**
 * Creates a new token for generating passwords
 * @returns 
 */
const createPasswordResetToken = function(){
    const abc = "abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*/-_".split("");
    var token=""; 
    for(i=0;i<10;i++){
         token += abc[Math.floor(Math.random()*abc.length)];
    }
    return token; //Will return a 10 bit "hash"

}

module.exports = createPasswordResetToken
// const createPasswordResetToken = function(){
//     const abc = "abcdefghijklmnopqrstuvwxyz1234567890".split("");
//     var token=""; 
//     for(i=0;i<32;i++){
//          token += abc[Math.floor(Math.random()*abc.length)];
//     }
//     return token; //Will return a 32 bit "hash"

// }

// module.exports = createPasswordResetToken