const dateRegex = new RegExp('^\\d\\d\\d\\d-\\d\\d-\\d\\d');

function jsonDateReviver(key, value) {
  if (dateRegex.test(value)) return new Date(value);
  return value;
}

class DisplayHomepage extends React.Component {
  render() {
    return (
        <div id="DisplayHomepage">
        <br/>
        <h1>Hotel Waitlist System</h1>
        <div className="navbar">
        <br />
        <nav>
          <a> Hotel California </a> |
          <a href="#DisplayHomepage" > Homepage </a> |
          <a href="#Menu"> Menu </a> |
        </nav>
        <br/>
      </div>
      </div>
    );
  }
}

function DisplayFreeSlots(props) {
  if (props.free>1){
    return ( 
      <div id="DisplayFreeSlots">
      <p>Now there are {props.free} slots available.</p>
      </div>
    );}
  else if (props.free == 1) {
    return (
    <div id="DisplayFreeSlots">
    <p>Now there is only 1 slot available.</p>
    </div>)
  }
  else {
    return (
    <div id="DisplayFreeSlots">
    <p>Sorry. There is no slot available now.</p>
    </div>)
  }
  }



class Menu extends React.Component {
  render() {
    return ( 
      <div id="Menu">
      <br/>
      <h2>Menu</h2>
      <a href="#AddCustomer" >Add</a>
      <br/>
      <a href="#DeleteCustomer">Remove</a>
      <br/>
      <a href="#DisplayCustomers">Display</a>
      <br/>
      <br/>
      </div>
    );
  }
}



function CustomerRow(props) {
  const customer = props.customer
  return (
    <tr>
      <td>{customer.serialNo}</td>
      <td>{customer.name}</td>
      <td>{customer.phone}</td>
      <td>{customer.timeStamp.toDateString()}</td>
    </tr>
  );
}

class AddCustomer extends React.Component {
  constructor() {
    super();
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(e) {
    e.preventDefault();
    const form = document.forms.customerAdd;
    const customer = {
      name: form.name.value, phone: form.phone.value
    }
    this.props.newCustomer(customer);
    form.name.value = ""; form.phone.value = "";
  }


  render() {
    return (
      <div id="AddCustomer">
        <h4 >Add</h4>
          <form name="customerAdd" onSubmit={this.handleSubmit}>
            <fieldset >
              <legend>Add a new customer</legend>
              <input type="text" name="name" placeholder="name" />
              <br/>
              <input type="text" name="phone" placeholder="phone number" />
              <br/>             
              <button>Add</button>
              <br/>
            </fieldset>
          </form>
      </div>
    );
  }
}

class DeleteCustomer extends React.Component {
  constructor() {
    super();
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(e) {
    e.preventDefault();
    const form = document.forms.customerRemove;
    const r =  Number(form.removeNo.value);
    this.props.removeCustomer(r);
    form.removeNo.value = "";
  }

  render() {
    return (
      <div id="DeleteCustomer">
        <h4 >Remove</h4>
        <form name="customerRemove" onSubmit={this.handleSubmit}>
            <fieldset >
              <legend>Remove an existing customer</legend>           
              <input type="text" name="removeNo" placeholder="Serial No." />
              <br/>             
              <button>Remove</button>
              <br/>
            </fieldset>
          </form>
      </div>
    );
  }
}



function DisplayCustomers(props) {
  const customerRows = props.customers.map(customer =>
      <CustomerRow key={customer.serialNo} customer={customer} />
    );

  
  return (
    <div id="DisplayCustomers">
      <h4 >Display</h4>
        <form>
          <fieldset>
            <legend>Current waitlist</legend>
            <br/>
            <table>
              <thead>
                <tr id="tr1">
                    <td>Serial No.</td>
                    <td>Name</td>
                    <td>Phone number</td>
                    <td>Time Stamp</td>
                </tr>
              </thead>
            <tbody>
              {customerRows}
            </tbody>
            </table>
            <br/>
          </fieldset>
        </form>
    </div>
  );
  }

async function graphQLFetch(query, variables = {}) {
  try {
    const response = await fetch('http://localhost:5000/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json'},
      body: JSON.stringify({ query, variables })
    });
    const body = await response.text();
    const result = JSON.parse(body, jsonDateReviver);
    if (result.errors) {
      const error = result.errors[0];
      if (error.extensions.code == 'BAD_USER_INPUT') {
        const details = error.extensions.exception.errors.join('\n ');
        alert(`${error.message}:\n ${details}`);
      } else {
        alert(`${error.extensions.code}: ${error.message}`);
      }
    }
    return result.data;
  } catch (e) {
    alert(`Error in sending data to server: ${e.message}`);
  }
}
  

class Waitlist extends React.Component{
  constructor() {
    super();
    this.state = { customers: [] };
    this.newCustomer = this.newCustomer.bind(this);
    this.removeCustomer = this.removeCustomer.bind(this);
  }

  componentDidMount() {
    this.loadData();
  }

  async loadData(){
    const query = `query {
      Customers{
        serialNo
        name
        phone
        timeStamp
      }
    }`;

    const data = await graphQLFetch(query);
    if (data){
    this.setState({customers: data.Customers});
    }
  };

  async newCustomer(customer) {
    const query = `mutation addCustomer($customer:CustomerInputs!) {
        addCustomer(newCustomer:$customer)
    }`
    const data = await graphQLFetch(query, { customer});
    if (data){
      this.loadData();
    }
    if(data.addCustomer){
    alert(data.addCustomer)}
  }

  async removeCustomer(r) {
    const query = `mutation{
      removeCustomer(targetId:${r})
  }`
  const data = await graphQLFetch(query, {r});
  this.loadData();
  if(data.removeCustomer){
  alert(data.removeCustomer)}
}


  render(){
  return (
    <div className="Waitlist">
    <DisplayHomepage/>
    <DisplayFreeSlots free={25 - this.state.customers.length}/>
    <Menu/>
    <AddCustomer newCustomer={this.newCustomer} free={25 - this.state.customers.length}/>
    <DeleteCustomer removeCustomer={this.removeCustomer} />
    <DisplayCustomers customers={this.state.customers}  />
    </div>
  );}
}


ReactDOM.render(<Waitlist />, document.getElementById('Content'));
