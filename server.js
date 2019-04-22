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

// Sign up
function createChild(uid, firstName, lastName) {
    const database = firebase.database();
    const ref = database.ref('users')
    ref.child(uid).set({
        // https://scotch.io/tutorials/use-expressjs-to-get-url-and-post-parameters
        firstName: firstName,
        lastName: lastName,
        startLat: null,
        startLong: null,
        destLat: null,
        destLong: null
    });
}

app.post('/signup', function(req, res) {
    console.log(req);
    console.log(req.body);
    firebase.auth().createUserWithEmailAndPassword(req.body.email, req.body.password)
        .then(function(value) {
            console.log("fulfilled!");
            console.log(value);
        })
        .catch(function(error) {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        // [START_EXCLUDE]
        if (errorCode === 'auth/weak-password') {
            res.send('The password is too weak.');
        } else {
            res.send(errorMessage);
        }
        // [END_EXCLUDE]
    });
    // [END createwithemail]
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            // User is signed in.
            let uid = user.uid;
            createChild(uid, req.body.firstName, req.body.lastName);
        } else {
            // No user is signed in.
        }
    });
});

// Sign in
app.post('/signin', function(req, res) {
    firebase.auth().signInWithEmailAndPassword(req.body.email, req.body.password).catch(function(error) {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        // [START_EXCLUDE]
        if (errorCode === 'auth/wrong-password') {
            res.send('Wrong password.');
        } else {
            res.send(errorMessage);
        }
    });
});

// Send email verification
app.post("/emailVerify", function(req, res) {
    firebase.auth().currentUser.sendEmailVerification().then(function() {
            // Email Verification sent!
            // [START_EXCLUDE]
            res.send('Email Verification Sent!');
            // [END_EXCLUDE]
    });
});

// Password reset
app.post("/passwordReset", function(req, res) {
    firebase.auth().sendPasswordResetEmail(req.body.email).then(function() {
        // Password Reset Email Sent!
        // [START_EXCLUDE]
        res.send('Password Reset Email Sent!');
        // [END_EXCLUDE]
    }).catch(function(error) {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        // [START_EXCLUDE]
        if (errorCode === 'auth/invalid-email') {
            res.send(errorMessage);
        } else if (errorCode === 'auth/user-not-found') {
            res.send(errorMessage);
        }
        // [END_EXCLUDE]
    });
});
// TODO: Figure out how to have frontend send start and dest coordinates to be stored in user data on backend (HTTPS POST request?)
app.post('/coordinates', function (req, res) {
    const ref = database.ref('users');
    const uid = auth.currentUser.uid;
    ref.child(uid).update({
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
    database.ref("users/" + req);
    return res.send({'test': 'test message here!'});
});

// app.get('/', function (req, res) {
//     console.log('GET root');
//     res.sendFile(path.join(__dirname, 'build', 'index.html'));
// });
// TODO: Come up with an algorithm for matching HomeBuddies Basic algorithm: between users A and B, find min(dist(locationA, locationB) + dist(destA, destB))

// TODO: Implement the basic algorithm into the services to create pairings
app.listen(port);
