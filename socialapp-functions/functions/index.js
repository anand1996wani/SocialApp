const functions = require('firebase-functions');
const express = require('express');
const app = express();
const { db } = require('./util/admin');
const FBAuth = require('./util/fbAuth');

const { getAllScreams, 
    postOneScream, 
    getScream,
    commentOnScream,
    likeScream,
    unlikeScream,
    deleteScream
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

app.delete('/scream/:screamId', FBAuth, deleteScream);
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

exports.createNotificationOnLike = functions.firestore.document('likes/{id}')
    .onCreate((snapshot) => {
        db.doc(`/screams/${snapshot.data().screamId}`).get()
            .then((data) => {
                if(data.exists){
                    return db.doc(`/notifications/${snapshot.id}`).set({
                        createdAt: new Date().toISOString(),
                        recipient: data.data().userHandle,
                        sender: snapshot.data().userHandle,
                        type: 'like',
                        read: false,
                        screamId: data.id
                    })
                }
            })
            .then(() => {
                return;
            })
            .catch(err => {
                console.error(err);
                return;
            })
    });

exports.createNotificationOnComment = functions.firestore.document('comments/{id}')
    .onCreate((snapshot) => {
        db.doc(`/screams/${snapshot.data().screamId}`).get()
            .then((doc) => {
                if(doc.exists){
                    return db.doc(`/notifications/${snapshot.id}`).set({
                        createdAt: new Date().toISOString(),
                        recipient: doc.data().userHandle,
                        sender: snapshot.data().userHandle,
                        type: 'comment',
                        read: false,
                        screamId: doc.id
                    })
                }
            })
            .then(() => {
                return;
            })
            .catch(err => {
                console.error(err);
                return;
            })
    });

exports.deleteNotification = functions.firestore.document(`likes/{id}`)
    .onDelete((snapshot) => {
        db.doc(`/notifications/${snapshot.id}`)
            .delete()
            .then(() => {
                return;
            })
            .catch((err) => {
                console.error(err);
                return;
            });
    })




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