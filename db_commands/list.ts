import { MongoClient } from 'mongodb';

module.exports = {
    name: 'list',
    async execute(client: MongoClient){
        const databasesList = await client.db().admin().listDatabases();
     
        console.log("Databases:");
        databasesList.databases.forEach(db => console.log(` - ${db.question}`));
    }
}
