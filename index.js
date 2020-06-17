const functions = require('firebase-functions');
const express = require('express')
const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");
const cors = require('cors');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://address-manager-1998.firebaseio.com"
  });

const app = express()
const db = admin.firestore();
app.use(cors());




app.get('/' , (req,res) => {
    const addressses = []
    db.collection('address').get().then(data => {
        if(data.empty) return res.status(200).json({data:addressses})

        data.docs.forEach(doc => {
            addressses.push(doc.data())
        })
        return res.status(200).json({data:addressses})
    })
    .catch(error => console.log(error))
})

app.post('/add' , (req,res) => {
    const errors = {}
    const address = {}
    if(req.body.type.trim() === '') errors.type = "Must not be empty"
    else address.type = req.body.type

    if(req.body.houseinfo.trim() === '') errors.houseinfo = "Must not be empty"
    else address.houseinfo = req.body.houseinfo

    if(req.body.area.trim() === '') errors.area = "Must not be empty"
    else address.area = req.body.area

    if(req.body.city.trim() === '') errors.city = "Must not be empty"
    else address.city = req.body.city

    if(req.body.pincode.trim() === '') errors.pincode = "Must not be empty"
    else if(req.body.pincode.length<6) errors.pincode = "Must be 6 digits long"
    else address.pincode = req.body.pincode

    if(req.body.state.trim() === '') errors.state = "Must not be empty"
    else address.state = req.body.state

    //  if error then send response with error object
    if(Object.keys(errors).length>0) return res.status(400).json({errors})

    // if no error, insert data into database
    db.collection('address').add(address)
    .then(() => {
        return res.status(200).json({message:'Done'})
    })
    .catch(error => console.log(error))
})

exports.api = functions.https.onRequest(app)