const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser');
require('dotenv').config()
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;

const port = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Hello World!')
})


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.cfr7q.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const appointmentsCollection = client.db("car-service").collection("appointments");
  const serviceCollection = client.db("car-service").collection("services");
  const reviewCollection = client.db("car-service").collection("review");
  const adminCollection = client.db("car-service").collection("admin");

  app.post('/addAppointment', (req, res) => {
    const appointment = req.body;
    appointmentsCollection.insertOne(appointment)
      .then(result => {
        res.status(200).json(result.insertedCount)
      })
  })

  app.get('/services', (req, res) => {
    serviceCollection.find()
      .toArray((err, items) => {
        res.send(items)
      })
  })

  app.get('/services/:id', (req, res) => {
    serviceCollection.find({ _id: ObjectId(req.params.id) })
      .toArray((err, documents) => {
        res.send(documents[0]);
      })
  })

  app.post('/addService', (req, res) => {
    const newService = req.body;
    serviceCollection.insertOne(newService)
      .then(result => {
        res.send(result.insertedCount > 0)
      })
  })

  app.post('/addReviews', (req, res) => {
    const newReview = req.body;
    reviewCollection.insertOne(newReview)
      .then(result => {
        res.send(result.insertedCount > 0)
      })
  })

  app.get('/reviews', (req, res) => {
    reviewCollection.find()
      .toArray((err, items) => {
        res.send(items)
      })
  })

  app.get('/orders', (req, res) => {
    const email = req.query.email;

    adminCollection.find({ email: email })
      .toArray((err, documents) => {
        if (documents.length)
          appointmentsCollection.find()
            .toArray((err, items) => {
              res.send(items)
            })
        if (documents.length === 0) {
          appointmentsCollection.find({ email: req.query.email })
            .toArray((err, documents) => {
              res.send(documents);
            })
        }
      })
  })

  app.post('/addAdmin', (req, res) => {
    const newAdmin = req.body;
    adminCollection.insertOne(newAdmin)
      .then(result => {
        console.log('Admin count', result.insertedCount)
        res.send(result.insertedCount > 0)
      })
  })

  app.post('/isAdmin', (req, res) => {
    const email = req.body.email
    adminCollection.find({ email: email })
      .toArray((err, admin) => {
        res.send(admin.length > 0);
      })

  })

});


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})