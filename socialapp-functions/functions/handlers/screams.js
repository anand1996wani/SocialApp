const { db } = require('../util/admin');


exports.getAllScreams = (request, response) => {
    db.collection('screams')
        .orderBy('createdAt', 'desc')
        .get()
        .then(data => { 
            let screams = [];
            data.forEach((doc) => {
                screams.push({
                    screamId: doc.id,
                    body: doc.data().body,
                    userHandle: doc.data().userHandle,
                    createdAt: doc.data().createdAt,
                    commentCount: doc.data().commentCount,
                    likeCount: doc.data().likeCount
                });
            });
            return response.json(screams);
        })
        .catch((err) => {
            console.error(err);
            response.status(500).json({ error: err.code });
        });
}

exports.postOneScream = (request, response) => {
    if ( request.body.body.trim() === `` ) {
        return response.status(400).json({ body: 'Body must not be empty'});
    }
    
    const newScream = {
        body: request.body.body,
        userHandle: request.user.handle,
        userImage: request.user.imageUrl,
        likeCount: 0,
        commentCount: 0,
        createdAt: new Date().toISOString()
    };

    db.collection('screams')
        .add(newScream)
        .then(doc => {
            const resScream = newScream;
            resScream.screamId = doc.id;
            response.json({ resScream });
        })
        .catch(err => {
            response.status(500).json({ error: `Error While Creating Scream`});
            console.error(err);
        });  
}
// Get one scream
exports.getScream = (request, response) => {
    let screamData = {};
    db.doc(`/screams/${request.params.screamId}`).get()
        .then(doc => {
            if(!doc.exists){
                return response.status(404).json({ error: 'Scream not found'});
            }
            screamData = doc.data();
            screamData.screamId = doc.id;
            return db.collection('comments')
                .orderBy('createdAt', 'desc')
                .where(`screamId`, `==`, request.params.screamId)
                .get();
        })
        .then(data => {
            screamData.comments = [];
            data.forEach(doc => {
                screamData.comments.push(doc.data())
            });
            return response.json(screamData);
        })
        .catch(err => {
            console.error(err);
            response.status(500).json({ error: err.code });
        })
}

exports.commentOnScream = (request, response) => {
    if(request.body.body.trim() === ``) return response.status(400).json({ error: 'Must not be empty'});

    const newComment = {
        body: request.body.body,
        createdAt: new Date().toISOString(),
        screamId: request.params.screamId,
        userHandle: request.user.handle,
        userImage: request.user.imageUrl
    }

    db.doc(`/screams/${request.params.screamId}`).get()
        .then(doc => {
            if(!doc.exists){
                return response.status(404).json({ error: 'Scream not found'});
            }
            return db.collection('comments').add(newComment);
        })
        .then(() => {
            return response.status(201).json(newComment);
        })
        .catch(err => {
            console.log(err);
            response.status(500).json({ error: err.code});
        })

}

// Like a scream
exports.likeScream = (request, response) => {
    
}