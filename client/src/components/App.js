import React, { Component } from "react";

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  useParams,
  Redirect
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
import Cookies from 'universal-cookie';
const cookies = new Cookies()

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
      userName: (cookies.get('name') ? cookies.get('name') : ""),
      userID: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
      roomID: "",
      redirect: "",
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
    
    roomID = roomID.substring(0, roomID.indexOf("?")>=0 ? roomID.indexOf("?"): undefined)
    

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

  createRoom = (roomID) => {
    let username = this.state.userName 
    if(username.length > 16) username = username.substring(0, 16)
    roomID = encodeURI(roomID).split('?').join('')
    if(username === "") username = "Guest"+makeid(5)
    this.setState({didPlay: true, userName: username})
    cookies.set('name', username, {path: '/'})
    
    
    let randomRoomID = roomID
    post('api/createNewRoom', {roomID: randomRoomID}).then((res) => {

      this.setState({roomID: randomRoomID, didPlay: true, redirect: "/"+randomRoomID}, () => {
        

      });
    })
  }

  playNow = () => {
    
    let username = this.state.userName 
    if(username.length > 16) username = username.substring(0, 16)
    if(username === "") username = "Guest"+makeid(5)
    cookies.set('name', username, {path: '/'})

    if(this.state.roomID === "") {
    post('api/createNewRoom', {roomID: "main"}).then((res) => {
      this.setState({roomID: "main", didPlay: true, userName: username}, () => {
       // window.location.href = '/main'
      });
    })
    }
    else {
      this.setState({didPlay: true});
    }
  };

  render() {
    if(this.state.redirect !== "") {
      let path = this.state.redirect
      this.setState({redirect: ""})
      return  <Router><Switch><Route path="/"><Redirect to={path} /></Route></Switch></Router>
    }
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

