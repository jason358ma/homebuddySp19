// This is the file for the backend services
const express = require('express');
const favicon = require('serve-favicon'); // require('express-favicon');
const firebase = require("firebase");
const path = require('path');
const port = process.env.PORT || 8080;
const app = express();

const config = {
    apiKey: "AIzaSyBtYCRExBERnTmIOWOA5MLhko93oi_7I88",
    authDomain: "emailtest-c5931.firebaseapp.com",
    databaseURL: "https://emailtest-c5931.firebaseio.com",
    projectId: "emailtest-c5931",
    storageBucket: "emailtest-c5931.appspot.com",
    messagingSenderId: "775804973647"
};
firebase.initializeApp(config);

const database = firebase.database();
const auth = firebase.auth();
app.use(express.json());

// body-parser already included in express (https://stackoverflow.com/questions/11625519/how-to-access-the-request-body-when-posting-using-node-js-and-express)
// const bodyParser = require('body-parser');
// app.use(bodyParser.json()); // support json encoded bodies
// app.use(bodyParser.urlencoded({ extended: true }));

app.use(favicon(__dirname + '/build/favicon.ico'));
// the __dirname is the current directory from where the script is running
app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, 'build')));
app.get('/ping', function (req, res) {
    console.log('ping?');
    return res.send('pong');
});
// TODO: design and set up account structures in Firebase

// TODO: Figure out how to have frontend send start and dest coordinates to be stored in user data on backend (HTTPS POST request?)
app.post('/post', function (req, res) {
    const ref = database.ref('users');
    const uid = auth.currentUser.uid;
    ref.child(uid).set({
        // https://scotch.io/tutorials/use-expressjs-to-get-url-and-post-parameters
        age: req.body.age,
        // email: req.body.email, //on firebase auth
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        // username: req.body.username, //on firebase auth
        startLat: req.body.startLat,
        startLong: req.body.startLong,
        destLat: req.body.destLat,
        destLong: req.body.destLong
    }, function (error) {
        if (error) {
            return res.send('post failed! Error is:' + error);
        } else {
            return res.send('post succeeded');
        }
    });
    // return res.send('post request');
});

// TODO: Firebase send personal profile info to user after logging in so that it can be displayed? (firstname, lastname, age)
app.get('/test', function (req, res) {
    database.ref("users/" + req.)
    return res.send({'test': 'test message here!'});
});

// app.get('/', function (req, res) {
//     console.log('GET root');
//     res.sendFile(path.join(__dirname, 'build', 'index.html'));
// });

app.listen(port);