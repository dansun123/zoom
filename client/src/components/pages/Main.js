import React, { Component } from "react";
import Chat from '../modules/Chat.js';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom' 
import "../../utilities.css";
import "./Main.css";
import { get, post } from "../../utilities";

//contains public chat and a create-room button

class Main extends Component {
  constructor(props) {
    super(props);
    // Initialize Default State
    this.state = {roomID: "Lobby", redirect: false};
  }

  componentDidMount() {
    // remember -- api calls go here!
    post("/api/setRoomID", {roomID: "Lobby"})
  }

  render() {
    let redirect = () => {
      this.setState({redirect: true})
    }
    if(this.state.redirect) return <Redirect to="/main" />
    return (
      <>
        <div className = 'main'>
          <div className = 'center lefthalf'>
            <button className = "button" onClick = {this.props.createRoom}>Create Room</button>
            <button className = "button" onClick = {() => redirect()}>Play Now</button>
          </div>
          <div className = 'mainchat righthalf'>
            <Chat messages={this.props.chat} roomID={this.state.roomID} />
          </div>
        </div>
      </>
    );
  }
}

export default Main;
