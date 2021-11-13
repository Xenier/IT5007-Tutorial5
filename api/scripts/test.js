
const { MongoClient } = require('mongodb');
const url = 'mongodb://localhost/waitlist';


async function testCRUD(){
    console.log('\n--- Test CRUD operations ---');
    const client = new MongoClient(url, { useNewUrlParser:true});
    try{
        await client.connect();
        console.log('Connected to MongoDB');
        const db = client.db();
        const collection = db.collection('customers');
        await collection.deleteMany({});

        //Create
        console.log('\n=== Create ===');
        const customer = {serialNo:1,name:'Alice',phone:'1234',timeStamp:new Date()};
        const result = await collection.insertOne(customer);
        console.log('Add one document.\nThe _id is:', result.insertedId);

        const customerArray= [{serialNo:2,name:'Bob',phone:'5678',timeStamp:new Date()},
                              {serialNo:3,name:'Carol',phone:'9101',timeStamp:new Date()}];
        await collection.insertMany(customerArray);
        console.log('Add two more documents.')
        let count = await collection.countDocuments();
        console.log("Now there are",count,'documents in the collection.');

        //Read
        console.log('\n===  Read ===');

        const allDocs = await collection.find({}).toArray();
        console.log('Display all documents:\n',allDocs);

        const doc2 = await collection.find({serialNo:2}).toArray();
        console.log('Find the 2nd document:\n',doc2[0])

        // Delete
        console.log('\n===  Delete ===');
        const targetId = 1;
        await collection.deleteOne({serialNo:targetId});
        console.log('Delete the document whose serialNo is:',targetId)

        count = await collection.countDocuments();
        const deletedDocs = await collection.find({}).toArray();
        console.log("Now there are",count,'documents:\n',deletedDocs);


        // Update
        console.log('\n===  Update ===');
        for( i=targetId+1 ; i<=count+1 ; i++){
            await collection.updateOne({serialNo:i},{ $set: {serialNo:i-1}} );
        }

        const updatedDocs = await collection.find({}).toArray();
        console.log('Update the serialNo:\n',updatedDocs);

        console.log('\n--- Test ends ---\n');

    } catch(err) {
        console.log(err);
    } finally {
        client.close();
    }
}

testCRUD();