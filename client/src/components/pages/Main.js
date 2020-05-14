import React, { Component } from "react";
import Chat from '../modules/Chat.js';

import "../../utilities.css";
import "./Main.css";

//contains public chat and a create-room button

class Main extends Component {
  constructor(props) {
    super(props);
    // Initialize Default State
    this.state = {roomID: "Lobby"};
  }

  componentDidMount() {
    // remember -- api calls go here!
  }

  render() {
    return (
      <>
        <div className = 'main'>
          <div className = 'center lefthalf'>
            <button className = "button" onClick = {this.props.createRoom}>Create Room</button>
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
