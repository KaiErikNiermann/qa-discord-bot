const {MongoClient} = require('mongodb');

module.exports = {
    name: 'find',
    async execute(client, nameOfListing) {
        const result = await client.db("main_db")
                            .collection("QandA_collection")
                            .findOne({ name: nameOfListing });
    
        if (result) {
            console.log(`Found a listing in the collection with the name '${nameOfListing}':`);
            console.log(result);
        } else {
            console.log(`No listings found with the name '${nameOfListing}'`);
        }
    }
}
