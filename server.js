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
        destLong: null,
        status: "not searching", // searching, pending, not searching
        buddy: null
    });
}

app.post('/signup', function(req, res) {
    firebase.auth().createUserWithEmailAndPassword(req.body.email, req.body.password).catch(function(error) {
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

function getDist(lat_A, long_A, lat_B, long_B) {

}

setInterval(pair, 5000);

function pair() {
    const pool = database.ref('users');

    /* Gather all searching users */
    let searchingUsers = {};
    pool.once("value").then(function(snapshot) {
        snapshot.forEach(function(snapshot) {
            const currUID = snapshot.key;
            const childData = snapshot.val();
            if (childData.status === "searching") {
                searchingUsers[currUID] = childData;
            }
        });
    });

    /* Pair searching users by distance*/
    for (var myUid in searchingUsers) {
        if (searchingUsers.hasOwnProperty(myUid)) {
            const myStartLat = pool.child(myUid).val().startLat;
            const myStartLong = pool.child(myUid).val().startLong;
            const myDestLat = pool.child(myUid).val().destLat;
            const myDestLong = pool.child(myUid).val().destLong;
            for (var buddyUid in searchingUsers) {
                if (myUid !== buddyUid && searchingUsers[myUid].buddy == null) {
                    if (searchingUsers.hasOwnProperty(buddyUid)) {
                        const buddyStartLat = searchingUsers[buddyUid].startLat;
                        const buddyStartLong = searchingUsers[buddyUid].startLong;
                        const buddyDestLat = searchingUsers[buddyUid].destLat;
                        const buddyDestLong = searchingUsers[buddyUid].destLong;
                        
                    }
                }
            }
            // update both the dictionary and the pool
            searchingUsers[myUid].buddy = buddyUid;
            searchingUsers[buddyUid].buddy = myUid;
            pool.child(myUid).val().buddy = buddyUid;
            pool.child(buddyUid).val().buddy = myUid;
        }
    }

    let partnerUID = "";
    let minDistSoFar = Number.POSITIVE_INFINITY;
    pool.once("value").then(function(snapshot) {
        snapshot.forEach(function(snapshot) {
            const currPartnerUID = snapshot.key;
            if (partnerUID !== myUid) {
                const childData = snapshot.val();
                const startDist = getDist(myStartLat, myStartLong, childData.startLat, childData.startLong);
                const destDist = getDist(myDestLat, myDestLong, childData.destLat, childData.destLong);
                const totalDist = startDist + destDist;
                if (totalDist < minDistSoFar) {
                    partnerUID = currPartnerUID;
                    minDistSoFar = totalDist;
                }
            }
        });
    });
    return null;
};

// TODO: Come up with an algorithm for matching HomeBuddies Basic algorithm: between users A and B, find min(dist(locationA, locationB) + dist(destA, destB)) using Manhattan distance
app.post('/findBuddy', function(req, res) {
    const pool = database.ref('users');
    const myUid = auth.currentUser.uid;
    const myStartLat = pool.child(myUid).val().startLat;
    const myStartLong = pool.child(myUid).val().startLong;
    const myDestLat = pool.child(myUid).val().destLat;
    const myDestLong = pool.child(myUid).val().destLong;

    pool.child(myUid).update({
        status: "searching"
    });

    /* Find partner in pool closest to user */
    let partnerUID = "";
    let minDistSoFar = Number.POSITIVE_INFINITY;
    pool.once("value").then(function(snapshot) {
        snapshot.forEach(function(snapshot) {
            const currPartnerUID = snapshot.key;
            if (partnerUID !== myUid) {
                const childData = snapshot.val();
                const startDist = getDist(myStartLat, myStartLong, childData.startLat, childData.startLong);
                const destDist = getDist(myDestLat, myDestLong, childData.destLat, childData.destLong);
                const totalDist = startDist + destDist;
                if (totalDist < minDistSoFar) {
                    partnerUID = currPartnerUID;
                    minDistSoFar = totalDist;
                }
            }
        });
    });



    return res.send(partnerUID);
});

app.post('/acceptBuddy', function(req, res) {
    const pool = database.ref('users');
    const myUID = auth.currentUser.uid;
    const buddyUID = pool.child(myUID).val().buddy;


    pool.child(myUID).update({
        status: "pending",
        buddy: buddyUID
    });

    if (pool.child(buddyUID).val().buddy == null) { // buddy unmatched

        // alert buddy that they've been paired
        return res.send(buddyUID);

    } else if (pool.child(buddyUID).val().buddy === auth.currentUser.uid) { // buddy already matched with user



        // Remove user and partner from pool
        pool.child(auth.currentUser.uid).remove();
        pool.child(buddyUID).remove();
    } else { // buddy not matched with user but already matched
        return res.send("");
    }
});

app.post('/declineBuddy', function(req, res) {
    const pool = database.ref('users');
    const buddyUID = pool.child(auth.currentUser.uid).val().buddy;

    if (pool.child(buddyUID).val().buddy == null) { // buddy unmatched

        // alert buddy that they've been paired

        // wait for buddy to accept

        // if buddy accepts, Remove user and partner from pool
        pool.child(auth.currentUser.uid).remove();
        pool.child(buddyUID).remove();
    } else {

    }
});

// TODO: Firebase send personal profile info to user after logging in so that it can be displayed? (firstname, lastname, age)

app.listen(port);