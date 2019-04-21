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
        // searching + buddy not null = not possible
        // searching + buddy null = in searchingUsers, waiting for match
        // pending + buddy not null = buddy assigned but no user decision of accept or reject
        // pending + buddy null = not possible
        // not searching + buddy not null = buddy found already, not in searchingUsers
        // not searching + buddy null = in pool and not searching, just logged in, not in searchingUsers
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
            res.send("Signup successful");
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
    /*
    Author: Harry Mumford-Turner
    Date: Feb. 15, 2018
    Availability: https://stackoverflow.com/questions/14560999/using-the-haversine-formula-in-javascript
     */

    // haversine formula
    const toRad = x => (x * Math.PI) / 180;
    const R = 6371; // km

    const dLat = toRad(lat_B - lat_A);
    const dLatSin = Math.sin(dLat / 2);
    const dLon = toRad(long_B - long_A);
    const dLonSin = Math.sin(dLon / 2);

    const a = (dLatSin * dLatSin) +
        (Math.cos(toRad(long_A)) * Math.cos(toRad(long_B)) * dLonSin * dLonSin);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    let distance = R * c;

    distance /= 1.60934;

    return distance; // returns distance in miles
}

let searchingUsers = {}; // TODO: only update and refer to searchingUsers and then flush changes to pool periodically? or update both everytime?

setInterval(pair, 5000);

function pair() {
    const pool = database.ref('users');

    /* Gather all searching users */
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
    for (let myUid in searchingUsers) {
        if (searchingUsers.hasOwnProperty(myUid)) {
            const myStartLat = pool.child(myUid).val().startLat;
            const myStartLong = pool.child(myUid).val().startLong;
            const myDestLat = pool.child(myUid).val().destLat;
            const myDestLong = pool.child(myUid).val().destLong;

            let partnerUID = "";
            let minDistSoFar = Number.POSITIVE_INFINITY;
            for (let buddyUid in searchingUsers) {
                if (myUid !== buddyUid && searchingUsers[myUid].buddy == null) {
                    if (searchingUsers.hasOwnProperty(buddyUid) && searchingUsers[buddyUid].buddy == null) {
                        const buddyStartLat = searchingUsers[buddyUid].startLat;
                        const buddyStartLong = searchingUsers[buddyUid].startLong;
                        const buddyDestLat = searchingUsers[buddyUid].destLat;
                        const buddyDestLong = searchingUsers[buddyUid].destLong;

                        const startDist = getDist(myStartLat, myStartLong, buddyStartLat, buddyStartLong);
                        const destDist = getDist(myDestLat, myDestLong, buddyDestLat, buddyDestLong);
                        const totalDist = startDist + destDist;
                        if (totalDist < minDistSoFar) {
                            partnerUID = buddyUid;
                            minDistSoFar = totalDist;
                        }
                    }
                }
            }
            // update both the dictionary and the pool
            searchingUsers[myUid].buddy = partnerUID;
            pool.child(myUid).val().buddy = partnerUID;
            searchingUsers[myUid].status = "pending";
            pool.child(myUid).val().status = "pending";

            searchingUsers[partnerUID].buddy = myUid;
            pool.child(partnerUID).val().buddy = myUid;
            searchingUsers[partnerUID].status = "pending";
            pool.child(partnerUID).val().status = "pending";

        }
    }

    // no return needed because buddy attributes of people updated, so refer to that to find buddy
}

async function findBuddy(myUid) {
    const pool = database.ref('users');

    let buddyName = "";
    let id = setInterval(findBuddyHelper, 1000);

    function findBuddyHelper () {
        let buddyUid = pool.child(myUid).val().buddy;
        if (buddyUid != null) {
            buddyName = pool.child(buddyUid).val().firstName + " " + pool.child(buddyUid).val().lastName;
            clearInterval(id);
        }
    }

    return buddyName;
}

app.post('/findBuddy', function(req, res) {
    const pool = database.ref('users');
    const myUid = auth.currentUser.uid;

    pool.child(myUid).val().status = "searching";
    pool.child(myUid).val().buddy = null;
    // do not update searchingUsers because user shouldn't be in there yet
    // no need to add user to searchingUsers because pair() should retrieve it from pool

    // see if buddy assigned - async: we don't want to be blocking while checking if buddy assigned to user
    findBuddy(myUid).then(function(buddyName) {
        return res.send(buddyName); // frontend might want buddyName to display to user
    });
});

async function waitForBuddy(buddyUid) {
    // waiting for buddy to make a decision
    let id = setInterval(acceptBuddyHelper, 1000);

    function acceptBuddyHelper () {
        if (searchingUsers[buddyUid].status !== "pending") {
            clearInterval(id);
        }
    }
}

function acceptBuddy(myUid, buddyUid) {
    const pool = database.ref('users');

    if (pool.child(buddyUid).val().status === "not searching" && pool.child(buddyUid).val().buddy === myUid) { // buddy agreed too

        // Prevent user and partner from being paired up with other people
        delete searchingUsers[myUid];
        delete searchingUsers[buddyUid];
        // do not remove from pool

        return true;
    } else if (!searchingUsers.hasOwnProperty(buddyUid) || (searchingUsers[buddyUid].status === "searching" && searchingUsers[buddyUid].buddy == null)) { // buddy removed themselves or rejected

        // the search continues
        searchingUsers[myUid].status = "searching";
        pool.child(myUid).val().status = "searching";
        searchingUsers[myUid].buddy = null;
        pool.child(myUid).val().buddy = null;

        return false;
    }
}

app.post('/acceptBuddy', function(req, res) {
    const pool = database.ref('users');
    const myUid = auth.currentUser.uid;
    const buddyUid = pool.child(myUid).val().buddy;

    searchingUsers[myUid].status = "not searching";
    pool.child(myUid).val().status = "not searching";

    // check if buddy has accepted user as their buddy (asynchronous)
    waitForBuddy(buddyUid).then(function() {
        return res.send(acceptBuddy(myUid, buddyUid)); // frontend should let user know if buddy accepted or not (true/false)
    });
});

app.post('/declineBuddy', function(req, res) {
    const pool = database.ref('users');
    const myUid = auth.currentUser.uid;

    searchingUsers[myUid].status = "searching";
    pool.child(myUid).val().status = "searching";
    searchingUsers[myUid].buddy = null;
    pool.child(myUid).val().buddy = null;
});

app.post('/stopSearching', function(req, res) {
    const pool = database.ref('users');
    const myUid = auth.currentUser.uid;

    delete searchingUsers[myUid];
    pool.child(myUid).val().status = "not searching";
    pool.child(myUid).val().buddy = null;
});

// TODO: Firebase send personal profile info to user after logging in so that it can be displayed? (firstname, lastname, age)

app.listen(port);