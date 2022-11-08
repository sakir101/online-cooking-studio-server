const express = require('express')
const cors = require('cors')
const app = express()
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()

app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.ttvi8dx.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
  try {
    const serviceCollection = client.db('rannabanna').collection('Services');
    app.get('/services', async (req, res) => {
      const query = {};
      const cursor = serviceCollection.find();
      const services = await cursor.toArray();
      res.send(services);
    });

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