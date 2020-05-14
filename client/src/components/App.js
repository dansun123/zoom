import React, { Component } from "react";

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  useParams
} from "react-router-dom";

import NotFound from "./pages/NotFound.js";
import Main from "./pages/Main.js";
import Topbar from "./modules/Topbar.js";

import "../utilities.css";

import { socket } from "../client-socket.js";

import { get, post } from "../utilities";

import Cookies from 'universal-cookie';
const cookies = new Cookies()


function Child() {
  // We can use the `useParams` hook here to access
  // the dynamic pieces of the URL.
  let { id } = useParams();

  return (
    <div>
      <h3>ID: {id}</h3>
    </div>
  );
} 


/**
 * Define the "App" component as a class.
 */
class App extends Component {
  // makes props available in this component
  constructor(props) {
    super(props);
    this.state = {
      userId: undefined,
      name2: undefined,
      name: undefined,
    };

    if (cookies.get('name')) {
      this.state.name = cookies.get('name');
    }

    this.handleChangeName = this.handleChangeName.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    get("/api/whoami").then((user) => {
      if (user._id) {
        // they are registed in the database, and currently logged in.
        this.setState({ userId: user._id });
      }
    });
  }

  handleLogin = (res) => {
    console.log(`Logged in as ${res.profileObj.name}`);
    const userToken = res.tokenObj.id_token;
    post("/api/login", { token: userToken }).then((user) => {
      this.setState({ userId: user._id });
      post("/api/initsocket", { socketid: socket.id });
    });
  };

  handleChangeName(event) {
    this.setState({name2: event.target.value});
    event.preventDefault();
  }

  handleSubmit(event) {
    alert('A name was submitted: ' + this.state.name2);
    let query = {newName: this.state.name2, oldName: this.state.name}
    post('api/newUser', query).then((res) => {
        this.setState({name: res.newName});
        cookies.set('name', res.newName, {path:'/'});
        cookies.set('id', res.id, {path:'/'})
    })
    event.preventDefault();
  }

  handleLogout = () => {
    this.setState({ userId: undefined });
    post("/api/logout");
  };

  createRoom = () => {
    post('api/createRoom').then((res) => {
      window.location.href = "http://localhost:5000/"+res.id;
    })
  }

  render() {
    return (
      <>
        <Topbar
          userId={this.state.userId}
          name = {this.state.name}
        />
        <div>
            <form onSubmit={this.handleSubmit}>
                <label>
                Name:
                <input type="text" value={this.state.name2} onChange={this.handleChangeName} />
                </label>
                <input type="submit" value="Submit"/>
            </form>
        </div>
        <button onClick = {this.createRoom}>Create Room</button>
        <Router>
          <div>
            <Switch>
              <Main
                exact path="/"
                handleLogin={this.handleLogin}
                handleLogout={this.handleLogout}
                userId={this.state.userId}
              />
              <Route path="/:id" children={<Child />} />
              <NotFound default />
            </Switch>
          </div>  
        </Router>
      </>
    );
  }
}



export default App;

