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
      chat: [{
        name: "DAN",
        message: "hi",
        gameID: "Lobby",
        timestamp: new Date(),
        systemMessage: false,
      }]
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

    socket.on('newMessage', (message) => {
      let newChat  = this.state.chat;
      newChat.push(message)
      this.setState({
        chat: newChat
      })
    })
  }

  handleLogin = (res) => {
    console.log(`Logged in as ${res.profileObj.name}`);
    const userToken = res.tokenObj.id_token;
    post("/api/login", { token: userToken }).then((user) => {
      this.setState({ userId: user._id , name: user.name});
      post("/api/initsocket", { socketid: socket.id });
    });
  };

  handleLogout = () => {
    this.setState({ userId: undefined });
    post("/api/logout");
  };

  createRoom = () => {
    post('api/createNewRoom', {}).then((res) => {
      window.location.href = "http://localhost:5000/"+res.id;
    })
  }

  updateState = (state) => {
    this.setState(state);
  };

  render() {
    let privateContent = (
      <>
        <Topbar
          userId={this.state.userId}
          name = {this.state.name}
          handleLogin={this.handleLogin}
          handleLogout={this.handleLogout}
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
                chat = {this.state.chat}
              />
              <Room 
                path = "/:id" 
                chat = {this.state.chat}
                updateState={this.updateState}
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

