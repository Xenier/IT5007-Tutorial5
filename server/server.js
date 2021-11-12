const fs = require('fs');
const express = require('express');
const { ApolloServer, UserInputError } = require('apollo-server-express');
const { GraphQLScalarType } = require('graphql');
const { format } = require('path');
const { formatError } = require('graphql/error');

const { Kind } = require('graphql/language')
const { MongoClient } = require('mongodb');
const { abort } = require('process');

const url = 'mongodb://localhost/waitlist';
let db;

async function connectToDb() {
  const client = new MongoClient(url, { useNewUrlParser: true});
  await client.connect();
  console.log('Connected to MongoDB at',url);
  db = client.db();
}

let Slots = 25;

const GraphQLDate = new GraphQLScalarType({
  name: 'GraphQLDate',
  description: 'A Date() type in GraphQL as a scalar',
  serialize(value) {
    return value.toISOString();
  },
});

const resolvers = {
  Query: {
    Customers,
  },
  Mutation: {
    addCustomer,
    removeCustomer,
  },
  GraphQLDate,
};

async function Customers(){
  const customers = await db.collection('customers').find({}).toArray();
  return customers;
};

async function getNextSequence(name) {
  const result = await db.collection('counters').findOneAndUpdate(
    { _id: name },
    { $inc: { current: 1 } },
    { returnOriginal: false },
  );
  return result.value.current;
}

function validateCustomer(newCustomer){
  const errors = [];
  if (newCustomer.name.length < 1){
    errors.push('Name can not be empty.');
  }
  if (newCustomer.phone.length < 4){
    errors.push('Phone number should contain 4 digits at least.');
  }
  else{
    var isnum = /^\d+$/.test(newCustomer.phone);
    if (!isnum){
      errors.push('Phone number should be digits.')
    }
  }
  if (errors.length > 0){
    throw new UserInputError('Invalid input(s)', {errors});
  }
};

async function addCustomer(_,{newCustomer}){
  validateCustomer(newCustomer);
  var customerDbLength = await db.collection('customers').count();
  if(customerDbLength < 25){
    newCustomer.serialNo = await getNextSequence('customers');
    newCustomer.timeStamp = new Date();
    const result = await db.collection('customers').insertOne(newCustomer)
    return "Add Successfully!"}
  else{
    return "Sorry.Failed to add."}
};

async function removeCustomer(_,{targetId}){
  var customerDbLength = await db.collection('customers').count();
  if(customerDbLength >= targetId && targetId > 0){
    await db.collection('customers').deleteOne({serialNo:targetId});
    for(i=targetId+1;i<=customerDbLength;i++){
      await db.collection('customers').updateOne({serialNo:i},{ $set: {serialNo:i-1}} );
    }
    await db.collection('counters').updateOne({_id:"customers"},{$set: {current:customerDbLength -1 }});
    return "Remove Succesfully"
  }
  return "Sorry. The input is invalid.";
};

const server = new ApolloServer({
  typeDefs: fs.readFileSync('./server/schema.graphql', 'utf-8'),
  resolvers,
  formatError: error => {
    console.log(error);
    return error;
  },
});

const app = express();

app.use(express.static('public'));

server.applyMiddleware({app,path: '/graphql'});

(async function () {
  try{
  await connectToDb();
  app.listen(3000, function () {
    console.log('App started on port 3000');
  });
  } catch (err) {
    console.log('ERROR:',err);
  }
})();

