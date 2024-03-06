const exprss = require('express')
const router = exprss.Router()
const bcrypt = require("bcryptjs");
const fs = require('fs');
const http = require('http');
const jwt = require('jsonwebtoken')
const { Server } = require('socket.io');


const server = http.createServer(router);

const io = new Server(server);



let mysql = require('mysql')
let connection = mysql.createConnection({
    host: "localhost",
    port: '3306',
    user: "root",
    password: "Ninjaarm-2003",
    database: "web_chat"
});

connection.connect((err) => {
    if (err) return console.error(err.message);

    console.log('Connected to the MySQL server.');
});
//get path to show website

router.get('/', (req, res) => {
    if (!req.cookies.token) {
        res.redirect('/signUp')
    }
    else {
        connection.query(`select * from room`, function (err, result) {
            if (err) throw err;
            res.render('index', { room: result, lengthRoom: result.length })
        });

    }
})

router.post('/', (req, res) => {
    const date = new Date();
    const newId = date.getTime()
    if(req.body.createRoom){
         connection.query(`INSERT INTO room (roomId, name_room) VALUES ('${newId}', '${req.body.createRoom}')`, function (err, result) {
        if (err) throw err;
        console.log("success create room!!");
        res.redirect('/')
    });
    }
    else if(req.body.joinRoom){
        connection.query(`select roomId from room where roomId = "${req.body.joinRoom}"`, function (err, result) {
            if (err) throw err;
            if(result){
                res.cookie("room", req.body.joinRoom, {
                    maxAge: 300000,
                    secure: true,
                    httpOnly: true,
                    sameSite: "none",
                });
                res.send(result)
            }
            else{
                res.redirect('/')
            }
        });
    }
   

})

//Login----------------------------------------------------
router.get('/login', (req, res) => {
    if (req.cookies.token) {
        res.redirect('/')
    }
    else {
        res.end(fs.readFileSync(`${__dirname}/../public/html/login.html`))
    }

})
router.post('/login', (req, res, next) => {
    connection.query(`select * from users where email = '${req.body.email}'`, function (err, result) {
        if (err) throw err;
        if (result[0]) {
            const checkPass = bcrypt.compareSync(req.body.password, result[0].password); // true
            if (checkPass) {
                console.log("success login!!");
                const name = result[0].userName;
                const token = jwt.sign({ name, }, "jtreiojmgfdoi", { expiresIn: "1h" });
                res.cookie("token", token, {
                    maxAge: 300000,
                    secure: true,
                    httpOnly: true,
                    sameSite: "none",
                });
                res.send('login success');
            }
            else {
                res.send('login failed');
            }
        } else {
            res.redirect('/signUp');
        }
    });


})
//Sign up -----------------------------------------------------------------------
router.get('/signUp', (req, res) => {
    if (req.cookies.token) {
        res.redirect('/')
    }
    else {
        res.end(fs.readFileSync(`${__dirname}/../public/html/signUp.html`))
    }

})

router.post('/signUp', (req, res) => {
    console.log(req.body)
    const pass = req.body.password
    const fpass = req.body.firmPassword

    if (pass == fpass) {
        const hash = bcrypt.hashSync(pass, 8);
        console.log(hash);
        connection.query(`INSERT INTO users (userId, userName,email,password) VALUES ('${req.body.username + 36969}', '${req.body.username}','${req.body.email}','${hash}')`, function (err, result) {
            if (err) throw err;
            console.log("success insert!!");
            res.redirect('/')
        });
    }
    else {
        res.redirect('/signUp')
    }
})

router.get('/chat', (req, res) => {
    res.end(fs.readFileSync(`${__dirname}/../public/html/Room_chat.html`))
})




router.get('/signOut', (req, res) => {
    res.clearCookie('token')
    res.redirect('/login')
})

module.exports = { router, io }