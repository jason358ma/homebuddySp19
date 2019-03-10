// This is the file for the backend services
const express = require('express');
const favicon = require('express-favicon');
const firebase = require("firebase");
const path = require('path');
const port = process.env.PORT || 8080;
const app = express();
// Initialize Firebase
// edit this b/c we need a new firebase
const config = {
    apiKey: "AIzaSyCRM49rUHIc6Qv_30xmz6elzunzr_qxH-0",
    authDomain: "homebuddy-4573e.firebaseapp.com",
    databaseURL: "https://homebuddy-4573e.firebaseio.com",
    projectId: "homebuddy-4573e",
    storageBucket: "homebuddy-4573e.appspot.com",
    messagingSenderId: "508290220635"
};
firebase.initializeApp(config);

const database = firebase.database();

app.use(favicon(__dirname + '/build/favicon.ico'));
// the __dirname is the current directory from where the script is running
app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, 'build')));
app.get('/ping', function (req, res) {
    console.log('ping?');
    return res.send('pong');
});
app.post('/post', function (req, res) {
    database.ref('testUser').set({
        username: 'testname',
        email: 'test@test.com',
        profile_picture : 'google.com'
    }, function (error) {
        if (error) {
            return res.send('post failed! Error is:' + error);
        } else {
            return res.send('post succeeded');
        }
    });
    // return res.send('post request');
});
app.get('/test', function (req, res) {
    return res.send({'test': 'test message here!'});
});
app.get('/', function (req, res) {
    console.log('GET root');
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});
app.listen(port);