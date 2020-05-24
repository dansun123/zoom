import React, { Component } from "react";
import Chat from '../modules/Chat.js';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom' 
import "../../utilities.css";
import "./Main.css";
import { get, post } from "../../utilities";
import TextField from "@material-ui/core/TextField";

//contains public chat and a create-room button

class Main extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
    // Initialize Default State
  }

  componentDidMount() {
    // remember -- api calls go here!
  }

  render() {
    return (
      <>
        <TextField
          
          label="Enter your name"
          variant="outlined"
          size="small"
          value={this.props.userName}
          fullWidth
          onChange={this.props.handleChange}
    
          />
        <button onClick = {()=>{this.props.createRoom()}}>Create Room</button>
        <button onClick = {()=>{this.props.playNow()}}>Play Now</button>
        <h1>Put some logo thing here and add css</h1>
      </>
    );
  }
}

export default Main;
