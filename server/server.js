const express = require('express');
const { ApolloServer, UserInputError } = require('apollo-server-express');
const fs = require('fs');
const { GraphQLScalarType } = require('graphql');
const { format } = require('path');
const { formatError } = require('graphql/error');

let Slots = 25;

var CustomerDB = [
];

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

function Customers(){
  return CustomerDB
};



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

function addCustomer(_,{newCustomer}){
  validateCustomer(newCustomer);
  if(CustomerDB.length < 25){
    newCustomer.serialNo = CustomerDB.length + 1
    newCustomer.timeStamp = new Date()
    CustomerDB.push(newCustomer)
    return "Add Successfully!"}
  else{
    return "Sorry.Failed to add."}
};

function removeCustomer(_,{targetId}){
  if(CustomerDB.length >= targetId && targetId > 0){
    CustomerDB.splice(targetId-1,1)
    for(i=0;i<CustomerDB.length;i++){
      CustomerDB[i].serialNo = i+1;
    }
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

app.listen(3000, function () {
  console.log('App started on port 3000');
});
