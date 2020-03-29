const functions = require('firebase-functions');
const express = require('express');
const app = express();

const FBAuth = require('./util/fbAuth');

const { getAllScreams, 
    postOneScream, 
    getScream,
    commentOnScream,
    likeScream,
    unlikeScream
} = require('./handlers/screams');

const { signup, 
        login, 
        uploadImage, 
        addUserDetails, 
        getAuthenticatedUser
    } = require('./handlers/users');

//screams route
app.get('/screams', getAllScreams);
app.post('/scream', FBAuth, postOneScream);
app.get('/scream/:screamId', getScream);

// TODO delete scream
app.post('/scream/:screamId/comment', FBAuth, commentOnScream);
app.get('/scream/:screamId/like', FBAuth, likeScream);
app.get('/scream/:screamId/unlike', FBAuth, unlikeScream);

// user routes
app.post('/signup', signup);
app.post('/login', login);
app.post('/user/image', FBAuth, uploadImage);
app.post('/user', FBAuth, addUserDetails);
app.get('/user', FBAuth, getAuthenticatedUser);

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