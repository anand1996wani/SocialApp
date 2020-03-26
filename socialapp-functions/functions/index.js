const functions = require('firebase-functions');
const express = require('express');
const app = express();

const FBAuth = require('./util/fbAuth');

const { getAllScreams, postOneScream } = require('./handlers/screams');
const { signup, login } = require('./handlers/users');

//screams route
app.get('/screams', getAllScreams);
app.post('/scream', FBAuth, postOneScream);

// user routes
app.post('/signup', signup);
app.post('/login', login);


exports.api = functions.https.onRequest(app);



// exports.getScreams = functions.https.onRequest((request, response) => {
//     admin.firestore().collection('screams').get()
//         .then(data => {
//             let screams = [];
//             data.forEach(doc => {
//                 screams.push(doc.data());
//             });
//             return response.json(screams);
//         })
//         .catch(err => console.error(err));
// });

// exports.createScream = functions.https.onRequest((request, responce) => {
//     if(request.method !== `POST`){
//         return responce.status(400).json({ error: `Method not allowed`});
//     }
//     const newScream = {
//         body: request.body.body,
//         userHandle: request.body.userHandle,
//         createdAt: admin.firestore.Timestamp.fromDate(new Date())
//     };

//     admin.firestore()
//         .collection('screams')
//         .add(newScream)
//         .then(doc => {
//             responce.json({ message: `document ${doc.id} created successfully`});
//         })
//         .catch(err => {
//             responce.status(500).json({ error: `Error While Creating Scream`});
//             console.error(err);
//         });
// });