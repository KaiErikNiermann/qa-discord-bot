const {MongoClient} = require('mongodb');

module.exports = {
    name: 'update',
    async execute(client, nameOfListing, updatedListing) {
        const result = await client.db("main_db")
                            .collection("QandA_collection")
                            .updateOne({ question: nameOfListing }, { $set: updatedListing });
    
        console.log(`${result.matchedCount} document(s) matched the query criteria.`);
        console.log(`${result.modifiedCount} document(s) was/were updated.`);
    }
}
