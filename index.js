const express = require('express'); 
const cors = require('cors');
const bodyParser = require('body-parser'); 
const fileUpload = require('express-fileupload');
const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');

require('dotenv').config()
// mongodb
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.q1oby.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const transporter = nodemailer.createTransport(smtpTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
})
);
const app = express(); 
// default options
app.use(fileUpload());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// server connected start
client.connect(err => {
  const rentCollection = client.db(process.env.DB_NAME).collection("rent");
  const bookingCollection = client.db(process.env.DB_NAME).collection("booking");

  /* add rent house*/
  app.post('/addRent', (req, res) =>{
    
    const title = req.body.title; 
    const location = req.body.location; 
    const bathroom = req.body.bathroom;  
    const bedroom = req.body.bedroom;  
    const price = req.body.price;  
    const priceDetail = req.body.priceDetail; 
    const propertyDetail = req.body.propertyDetail; 
    const time = req.body.time; 
    // all images save in array
    const image = [req.body.images0, req.body.images1, req.body.images2, req.body.images3]; 

    rentCollection.insertOne({title, location, bathroom, bedroom, price, priceDetail, propertyDetail, image, time})
      .then(result=> res.send(result.insertedCount > 0)) 
  
    }) 

  /* show all rent house  */
  app.get('/rentList/:limit', (req, res)=> {
    
    rentCollection.find({}).sort({time: -1}).limit(parseInt(req.params.limit))
    .toArray((err, documents) => {
        res.send(documents);
    })
  
  })
/* single post data */
  app.get('/post/:id', (req, res)=>{

     rentCollection.find({_id: ObjectId(req.params.id)})
      .toArray((err, documents)=>{
        res.send(documents)
      })
  })
/* insert booking  */
app.post('/booking', (req, res)=>{

  const name = req.body.name; 
  const phone = req.body.phone; 
  const email = req.body.email; 
  const message = req.body.message; 
  const post_id = req.body.postId; 

  bookingCollection.insertOne({name, phone, email, message, post_id})
  .then(result=> res.send(result.insertedCount > 0))

})
/* show all booking */
app.get('/showBookingLIst', (req, res)=>{

  bookingCollection.find()
  .toArray((err, documents) => {
    res.send(documents);
  })

})
  /* update the order status */
  app.patch('/updateBookingList/:id', (req, res)=>{
    
    bookingCollection.updateOne({ _id: ObjectId(req.params.id)},
      { $set: { status: req.body.status}
    })
    .then(function(result) {
      res.send(1===1);
    })    
    
})

   //root url 
    app.get('/', (reg, res) => {
        res.send("nope");
    })
 
});


app.listen(process.env.PORT || '4000')
