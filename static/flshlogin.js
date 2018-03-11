var md = forge.md.sha256.create();
md.update('The quick brown fox jumps over the lazy dog');
console.log(md.digest().toString());

function loginFunction(username, password) {
   // if browser supports localStorage
   if (typeof(Storage) !== "undefined"){
     // password is hashed to sha256
     var myUsername = $("#username").val();
     var myCryptoPassword = CryptoJS.MD5($("#password").val()).toString();
     // API takes POST requests for some reason
     // Peter Alvaro might teach you that RESTful APIs don't use POST
     $.ajax({
         type: "POST",
         url: "https://slugsense.herokuapp.com/api/users/login",
         data: {
           username: myUsername,
           password: myPassword
         },
         success: function(data){
           localStorage.setItem("token", data.api_token);
           // redirect you to html where build.js is stored
           window.location.href = '/'
         },
         error: function (err) {
           // API response can tell you what goes wrong
           if (err.responseJSON) {
             $("#errMess").text(err.responseJSON.message)
           } else {
             $("#errMess").text("internet connectivity issues")
           }
         }
       });
   }
   else {
     $("#errMess").text("Your browser is out of date! Please use a more recent browser");
   }
 }
