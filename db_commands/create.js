const {MongoClient} = require('mongodb');

module.exports = {
    name: 'create', 
    async execute(client, newListing){
        const result = await client.db("main_db").collection("QandA_collection").insertOne(newListing);
        console.log(`New listing created with the following id: ${result.insertedId}`);
    }
}
