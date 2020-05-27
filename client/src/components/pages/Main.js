import React, { Component } from "react";
import Chat from '../modules/Chat.js';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom' 
import "../../utilities.css";
import "./Main.css";
import { get, post } from "../../utilities";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";

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
          autoFocus 
          onKeyPress={(event) => {
            if(event.charCode===13) {
              this.props.playNow()
            }
        }} />
        <Button onClick = {()=>{this.props.createRoom()}}>Create Room</Button>
        <Button onClick = {()=>{this.props.playNow()}}>{this.props.roomID === "" ? "Play Now" : ("Join Room " + this.props.roomID)}</Button>
       
      </>
    );
  }
}

export default Main;
