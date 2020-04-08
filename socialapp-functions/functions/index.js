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
        getAuthenticatedUser,
        getUserDetails,
        markNotificationsRead
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
app.get('/user/:handle/',getUserDetails);
app.post('/notifications', FBAuth ,markNotificationsRead);


exports.api = functions.https.onRequest(app);

exports.createNotificationOnLike = functions.firestore.document('likes/{id}')
    .onCreate((snapshot) => {
        return db.doc(`/screams/${snapshot.data().screamId}`).get()
            .then((data) => {
                if(data.exists && doc.data().userHandle !== snapshot.data().userHandle ){
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
            .catch(err => {
                console.error(err);
            })
    });

exports.createNotificationOnComment = functions.firestore.document('comments/{id}')
    .onCreate((snapshot) => {
        return db.doc(`/screams/${snapshot.data().screamId}`).get()
            .then((doc) => {
                if(doc.exists && doc.data().userHandle !== snapshot.data().userHandle){
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
            .catch(err => {
                console.error(err);
            })
    });

exports.deleteNotification = functions.firestore.document(`likes/{id}`)
    .onDelete((snapshot) => {
        return db.doc(`/notifications/${snapshot.id}`)
            .delete()
            .catch((err) => {
                console.error(err);
            });
    });

exports.onUserImageChange = functions.firestore.document('/users/{userId}')
    .onUpdate((change) => {
        console.log(change.before.data());
        console.log(change.after.data());
        if(change.before.data().imageUrl !== change.after.data().imageUrl ) {
            console.log('Image has changed');
            const batch = db.batch();
            return db.collection('screams').where('userHandle','==', change.before.data().handle).get()
                .then((data) => {
                    data.forEach((doc) => {
                        const scream = db.doc(`/screams/${doc.id}`);
                        batch.update(scream, { userImage: change.after.data().imageUrl });
                    });
                    return batch.commit();
                });
        } else return true;
    });



exports.onScreamDelete = functions.firestore.document('/screams/{screamId}')
    .onDelete((snapshot, context) => {
        const screamId = context.params.screamId;
        const batch = db.batch();
        return db.collection('comments').where('screamId', '==', screamId).get()
            .then(data => {
                data.forEach(doc => {
                    batch.delete(db.doc(`/comments/${doc.id}`));
                })
                return db.collection('likes').where('screamId', '==', screamId).get()            
            })
            .then(data => {
                data.forEach(doc => {
                    batch.delete(db.doc(`/likes/${doc.id}`));
                })
                return db.collection('notifications').where('screamId', '==', screamId).get()
            })
            .then(data => {
                data.forEach(doc => {
                    batch.delete(db.doc(`/notifications/${doc.id}`));
                })
                return batch.commit();
            })
            .catch(err => {
                console.error(err);
            })
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
