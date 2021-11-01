
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
    if (this.props.free > 0){
    this.props.newCustomer(customer);}
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


class Waitlist extends React.Component{
  constructor() {
    super();
    this.state = { customers: [] };
    this.newCustomer = this.newCustomer.bind(this);
    this.removeCustomer = this.removeCustomer.bind(this);
  }


  newCustomer(customer) {
    customer.serialNo = this.state.customers.length + 1;
    customer.timeStamp = new Date();
    const newWaitlist = this.state.customers.slice();
    newWaitlist.push(customer);
    this.setState({ customers: newWaitlist });
  }

  removeCustomer(r) {
    const newWaitlist = this.state.customers.slice();
    if(r>0 && r <= newWaitlist.length){
    newWaitlist.splice(r-1,1);
    }
    var tmpWaitlist = newWaitlist.slice();
    for(let i=0;i<tmpWaitlist.length;i++){
      tmpWaitlist[i].serialNo = (i+1);
    }
    this.setState({ customers: tmpWaitlist });
  }


  render(){
  return (
    <div className="Waitlist">
    <DisplayHomepage/>
    <DisplayFreeSlots free={20 - this.state.customers.length}/>
    <Menu/>
    <AddCustomer newCustomer={this.newCustomer} free={20 - this.state.customers.length}/>
    <DeleteCustomer removeCustomer={this.removeCustomer} />
    <DisplayCustomers customers={this.state.customers}  />
    </div>
  );}
}


ReactDOM.render(<Waitlist />, document.getElementById('Content'));
