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
import InputSong from "./modules/InputSong.js";

import Record from "../../dist/favicon.png"

import "../utilities.css";

import { socket } from "../client-socket.js";

import { get, post } from "../utilities";

/**
 * Define the "App" component as a class.
 */
class App extends Component {
  // makes props available in this component
  constructor(props) {
    super(props);
    this.state = {
      name: "",
      roomID: "",
    };

    // if (cookies.get('name')) {
    //   this.state.name = cookies.get('name');
    // }

  }

  componentDidMount() {
    this.setState({
      roomID: window.location.href.substring(window.location.href.indexOf("/",9)+1)
    })
    socket.on('newMessage', (message) => {
      let newChat  = this.state.chat;
      newChat.push(message)
      this.setState({
        chat: newChat
      })
    })
  }

  handleChange = event => {
    this.setState({ name: event.target.value });
  };

  createRoom = () => {
    post('api/createNewRoom', {}).then((res) => {
      this.setState({
        roomID: res.id
      })
    })
  }

  playNow = () => {
    this.setState({roomID: 'main'});
  };

  render() {
    let gameContent =  
      (
      <>
        {this.state.isLoading ? <h1>Loading...</h1> :
        <Room
          name = {this.state.name}
          roomID = {this.state.roomID}
        />
  }
      </>
    );

    let generalContent = (
      <>
        <Topbar
        />
        <Main
          name = {this.state.name}
          handleChange = {this.handleChange}
          createRoom = {this.createRoom}
          playNow = {this.playNow}
        />
      </>
    )
    

    return (
      <>
        <button onClick = {()=>{console.log(this.state)}}>log app state</button>
        {this.state.roomID.length>1 ? gameContent : generalContent}
      </>
    );
  }
}



export default App;

