var express=require('express');
var path=require('path');
var app=express();
var bodyParser=require('body-parser');

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

require('./router/router.js')(express,app);

app.listen(3000,(err)=>{
  console.log('Server running on port 3000');
})


// Kindly refer the Startup Guide.txt for details of this project
