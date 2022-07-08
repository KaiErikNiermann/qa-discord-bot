const {MongoClient} = require('mongodb');

module.exports = {
    name: 'create', 
    async execute(client, newListing){
        const result = await client.db("sample_airbnb").collection("listingsAndReviews").insertOne(newListing);
        console.log(`New listing created with the following id: ${result.insertedId}`);
    }
}
