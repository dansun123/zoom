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
import Room from "./pages/Room.js";

import "../utilities.css";

import { socket } from "../client-socket.js";

import { get, post } from "../utilities";

// import Cookies from 'universal-cookie';
// const cookies = new Cookies()


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

    // if (cookies.get('name')) {
    //   this.state.name = cookies.get('name');
    // }

  }

  componentDidMount() {
    get("/api/whoami").then((user) => {
      if (user._id) {
        // they are registed in the database, and currently logged in.
        this.setState({ userId: user._id, name:user.name });
      }
    });
  }

  handleLogin = (res) => {
    console.log(`Logged in as ${res.profileObj.name}`);
    const userToken = res.tokenObj.id_token;
    post("/api/login", { token: userToken }).then((user) => {
      this.setState({ userId: user._id , name: user.name});
      post("/api/initsocket", { socketid: socket.id });
    });
  };

  // handleChangeName = (event) => {
  //   this.setState({name2: event.target.value});
  //   event.preventDefault();
  // }

  // handleSubmit = (event) => {
  //   alert('A name was submitted: ' + this.state.name2);
  //   let query = {newName: this.state.name2, oldName: this.state.name}
  //   post('api/newUser', query).then((res) => {
  //       this.setState({name: res.newName});
  //       cookies.set('name', res.newName, {path:'/'});
  //   })
  //   event.preventDefault();
  // }

  handleLogout = () => {
    this.setState({ userId: undefined });
    post("/api/logout");
  };

  createRoom = () => {
    post('api/createNewRoom').then((res) => {
      window.location.href = "http://localhost:5000/"+res.id;
    })
  }

  render() {
    let privateContent = (
      <>
        <Topbar
          userId={this.state.userId}
          name = {this.state.name}
          handleLogin={this.handleLogin}
          handleLogout={this.handleLogout}
          userId={this.state.userId}
        />
        <Router>
          <div>
            <Switch>
              <Main
                exact path="/"
                handleLogin={this.handleLogin}
                handleLogout={this.handleLogout}
                userId={this.state.userId}
                createRoom = {this.createRoom}
              />
              <Room 
                path = "/:id" 
              /> />
              <NotFound default />
            </Switch>
          </div>  
        </Router>
      </>
    );

    let publicContent = (
      <>
        <Topbar
            userId={this.state.userId}
            name = {this.state.name}
            handleLogin={this.handleLogin}
            handleLogout={this.handleLogout}
            userId={this.state.userId}
        />
        <div>
          Memorize the lyrics to your favorite songs on the Billboard Top 500 hits
          and improve your typing speed while your'e at it! Log in to play.
        </div>
      </>
    )
    return (
      <>
        {this.state.userId ? privateContent: publicContent}
      </>
    );
  }
}



export default App;

