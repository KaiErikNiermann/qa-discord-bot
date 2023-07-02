import { MongoClient, Document } from 'mongodb';

module.exports = {
    name: 'create', 
    async execute(client: MongoClient, newListing: db_listing) {
        const result = await client.db("main_db").collection<db_listing>("QandA_collection").insertOne(newListing);
        console.log(`New listing created with the following id: ${result.insertedId}`);
    }
}
