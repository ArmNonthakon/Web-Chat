const express = require('express')
const cookieParser = require("cookie-parser");
const path = require('path')
const { router, io } = require('./router/myRouter')
const app = express()
app.use(express.json());
app.set('views',path.join(__dirname,'views'))
app.set('view engine','ejs')
app.use(express.static(path.join(__dirname +'/public')));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(router)

io.on('connection', (socket) => {
    console.log('A user connected via WebSocket');
  });

app.listen(3000,()=>{
    console.log('start server in port in 3000')
    
})