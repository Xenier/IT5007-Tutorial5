db.customers.remove({});

const customerDB = []

db.customers.insertMany(customerDB);
const count = db.customers.count();
print("Inserted",count,'customers');

db.counters.remove({_id:'customers'});
db.counters.insert({_id:'customers', current:count})

db.customers.createIndex({serialNo:1},{unique:true})
db.customers.createIndex({name:1});
db.customers.createIndex({phone:1});