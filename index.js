const express = require('express')
const cors = require('cors')
const app = express()
const port = process.env.PORT || 5000;
var jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()

//middleware use
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.ttvi8dx.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

//JWT token
function verifyJwt(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).send({ message: 'unauthorized access' });
  }
  const token = authHeader.split(' ')[1];

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: 'Forbidden access' });
    }
    req.decoded = decoded;
    next();
  })
}

async function run() {
  try {
    const serviceCollection = client.db('rannaBanna').collection('myservices');
    const reviewCollection = client.db('rannaBanna').collection('review');

    app.post('/jwt', (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' })
      res.send({ token });

    });

    app.get('/service', async (req, res) => {
      const query = {};
      const cursor = serviceCollection.find();
      const services = await cursor.limit(3).toArray();
      res.send(services)
    });

    app.get('/allservices', async (req, res) => {
      const query = {};
      const cursor = serviceCollection.find();
      const allservices = await cursor.toArray();
      res.send(allservices);
    });

    app.get('/allservices/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const service = await serviceCollection.findOne(query);
      res.send(service);
    });

    app.post('/addservice', async (req, res) => {
      const service = req.body;
      const result = await serviceCollection.insertOne(service);
      res.send(result);
    });
    app.post('/addreview', async (req, res) => {
      const review = req.body;
      const result = await reviewCollection.insertOne(review);
      res.send(result);
    });

    app.get('/review', async (req, res) => {
      const query = {};
      const cursor = reviewCollection.find().sort({ time: -1 });
      const reviews = await cursor.toArray();
      res.send(reviews);
    });

    app.get('/onereview', verifyJwt, async (req, res) => {
      const decoded = req.decoded;

      if(decoded.email !== req.query.email){
        res.status(403).send({message: 'Unauthorized access'});
      }

      const cursor = await reviewCollection.find({ email: { $in: [req.query.email] } })
        ;
      const reviews = await cursor.toArray();
      res.send(reviews)
    });
    app.patch('/review/:id', async (req, res) => {
      const id = req.params.id;

      const update = req.body;
      const query = { _id: ObjectId(id) };
      const updatedDocs = {
        $set: {
          desc: update.desc,
          rating: update.rating
        }
      }
      const result = await reviewCollection.updateMany(query, updatedDocs)


      res.send(result);
    });

    app.delete('/review/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await reviewCollection.deleteOne(query);
      res.send(result);
    })

  }
  finally {

  }
}

run().catch(err => console.error(err));


app.get('/', (req, res) => {
  res.send('Rannabanna app is running')
})

app.listen(port, () => {
  console.log(`Rannabanna app listening on port ${port}`)
})