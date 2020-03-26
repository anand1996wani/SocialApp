const { db } = require('../util/admin');

const config = require('../util/config');

const { validateSignupData, validateLoginData } = require('../util/validators');

const firebase = require('firebase');

firebase.initializeApp(config);


let token, userId;
exports.signup = (request, response) => {
    const newUser = {
        email: request.body.email,
        password: request.body.password,
        confirmPassword: request.body.confirmPassword,
        handle: request.body.handle,
    };

    const { valid, errors } = validateSignupData(newUser);
    if(!valid) return response.status(400).json(errors);
    
    db.doc(`/users/${newUser.handle}`).get()
        .then(doc => {
            if(doc.exists){
                return response.status(400).json({ handle: 'This handle is already taken'}); 
            }else{
                return firebase
                    .auth()
                    .createUserWithEmailAndPassword(newUser.email, newUser.password);
            }
        })
        .then(data => {
            userId = data.user.uid;
            return data.user.getIdToken();
        })
        .then(tok => {
            token = tok;
            const userCredentials = {
                handle: newUser.handle,
                email: newUser.email,
                createdAt: new Date().toISOString(),
                userId: userId
            };
            return db.doc(`/users/${newUser.handle}`).set(userCredentials);
        })
        .then((data) => {
            return response.status(201).json({ token });
        })
        .catch(err => {
            console.error(err);
            if(err.code === 'auth/email-already-in-use'){
                return response.status(400).json({ email: 'Email is already in use'});
            } else {
                return response.status(500).json({ error: err.code });
            }
        });
}

exports.login = (request,response) => {
    const curruser = {
        email: request.body.email,
        password: request.body.password
    };

    const { valid, errors } = validateLoginData(curruser);
    if(!valid) return response.status(400).json(errors);


    firebase.auth().signInWithEmailAndPassword(curruser.email, curruser.password)
        .then(data => {
            return data.user.getIdToken();           
        })
        .then(token => {
            return response.json({ token });
        })
        .catch(err => {
            console.error(err);
            if(err.code === 'auth/wrong-password'){
                return response.status(403).json({ general: "Wrong credentials, please try again"});
            }else if(err.code === 'auth/user-not-found'){
                return response.status(403).json({ generel: "Email address not registered !!! Please Sign up"});
            }else{
                return response.status(500).json({error: err.code});
            }
        });
}