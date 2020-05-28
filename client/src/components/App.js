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


function makeid(length) {
  var result           = '';
  var characters       = '0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
     result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
/**
 * Define the "App" component as a class.
 */
class App extends Component {
  // makes props available in this component
  constructor(props) {
    super(props);
    this.state = {
      userName: "",
      userID: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
      roomID: "",
      socketid: "",
      didPlay: false,
      chat: []
    };

    // if (cookies.get('name')) {
    //   this.state.name = cookies.get('name');
    // }

  }

  componentDidMount() {
    let roomID = window.location.href.substring(window.location.href.indexOf("/",9)+1)
    roomID = roomID.substring(0, roomID.indexOf("?")>0 ? roomID.indexOf("?"): undefined)
    this.setState({
      roomID: roomID,
      didPlay: false
    })
    socket.on('connect', () => {
      this.setState({socketid: socket.id})
    });
    socket.on('newMessage', (message) => {
      let newChat  = this.state.chat;
      newChat.push(message)
      this.setState({
        chat: newChat
      })
    })
  }

  handleChange = event => {
    this.setState({ userName: event.target.value });
  };

  createRoom = () => {
    this.setState({didPlay: true})
    if(this.state.userName==="") {
      this.setState({userName: "Guest"+makeid(5)})
    }
    let randomRoomID = Math.random().toString(36).substring(2, 15)
    post('api/createNewRoom', {roomID: randomRoomID}).then((res) => {

      this.setState({roomID: randomRoomID, didPlay: true}, () => {
       // window.location.href = ('/'+randomRoomID);
      });
    })
  }

  playNow = () => {
    if(this.state.userName==="") {
      this.setState({userName: "Guest"+makeid(5)})
    }
    if(this.state.roomID === "") {
    post('api/createNewRoom', {roomID: "main"}).then((res) => {
      this.setState({roomID: "main", didPlay: true}, () => {
       // window.location.href = '/main'
      });
    })
    }
    else {
      this.setState({didPlay: true});
    }
  };

  render() {
    let gameContent =  
      (
      <>
        {this.state.isLoading ? <h1>Loading...</h1> :
        <Room
          userName = {this.state.userName}
          roomID = {this.state.roomID}
          userID = {this.state.userID}
          chat = {this.state.chat}
          socketid = {this.state.socketid}
        />
  }
      </>
    );

    let generalContent = (
      <>
        <Topbar
        />
        <Router>
          <div>
            <Switch>
              <InputSong
                exact path = "/input"
              />
              <Main
                userName = {this.state.userName}
                userID = {this.state.userID}
                handleChange = {this.handleChange}
                createRoom = {this.createRoom}
                playNow = {this.playNow}
                roomID = {this.state.roomID}
                default
              />
            </Switch>
          </div>
        </Router>
      </>
    )
    

    return (
      <>
        {/* <button onClick = {()=>{get('/api/printall', {title: "Best Song Ever"})}}>log app state</button> */}
        {this.state.didPlay ? gameContent : generalContent}
      </>
    );
  }
}



export default App;

