import React, { Component } from "react";

import "../../utilities.css";
import "./Main.css";

//contains public chat and a create-room button

class Main extends Component {
  constructor(props) {
    super(props);
    // Initialize Default State
    this.state = {};
  }

  componentDidMount() {
    // remember -- api calls go here!
  }

  render() {
    return (
      <>
        <br></br>
        <br></br>
        <br></br>
        <div>Main</div>
        <button onClick = {this.props.createRoom}>Create Room</button>
        {/* <Chat></Chat> */}
      </>
    );
  }
}

export default Main;
