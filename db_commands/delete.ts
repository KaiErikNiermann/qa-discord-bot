import { MongoClient, Document } from 'mongodb';

module.exports = {
    name: 'delete', 
    async execute(client: MongoClient, filter: Document) {
        await client.db("main_db").collection("QandA_collection").deleteOne(filter);
    }
}
