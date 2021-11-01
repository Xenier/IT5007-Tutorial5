const express = require('express');
const { ApolloServer} = require('apollo-server-express');
const fs = require('fs')



let testCus = {
  id: 1,
  name: "Amy",
  phone:"1234",
  timeStamp:"Tue Nov 02 2021"
}

const resolvers = {
  Query: {
    id: () => testCus.id,
    name: () => testCus.name,
    phone: () => testCus.phone,
    timeStamp: () => testCus.timeStamp
  },
  Mutation: {
    addCustomer,
    removeCustomer,
  }
}

function addCustomer(_, {newCustomer}){
  testCus.name = newCustomer;
  return newCustomer
}

function removeCustomer(_,{targetId}){
  return targetId;
}

const server = new ApolloServer({
  typeDefs: fs.readFileSync('.server/schema.graphql','utf-8'),
  resolvers
})

const app = express();

app.use(express.static('public'));

server.applyMiddleware({app,path: '/graphql'});

app.listen(3000, function () {
  console.log('App started on port 3000');
});
