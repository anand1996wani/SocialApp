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

exports.postOneScream = (request, responce) => {
    if ( request.body.body.trim() === '' ) {
        return response.status(400).json({ body: 'Body must not be empty'});
    }
    
    const newScream = {
        body: request.body.body,
        userHandle: request.user.handle,
        createdAt: new Date().toISOString()
    };

    db.collection('screams')
        .add(newScream)
        .then(doc => {
            responce.json({ message: `document ${doc.id} created successfully`});
        })
        .catch(err => {
            responce.status(500).json({ error: `Error While Creating Scream`});
            console.error(err);
        });  
}