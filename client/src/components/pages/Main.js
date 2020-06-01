import React, { Component } from "react";
import Chat from '../modules/Chat.js';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom' 
import "../../utilities.css";
import "./Main.css";
import { get, post } from "../../utilities";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

//contains public chat and a create-room button


class Main extends Component {
  constructor(props) {
    super(props);
    this.state = {
      roomName: "",
      createRoomOpen: false,
      initialDialogOpen: true 
    };
    // Initialize Default State
  }

  componentDidMount() {
    // remember -- api calls go here!

  }

  render() {
    return (
      <>
        
        <Dialog open={this.state.initialDialogOpen} onClose={()=>{this.props.playNow()}} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">You are joining {this.props.roomID === "" ? "Main Room" : ("Room " + this.props.roomID)}</DialogTitle>
        <DialogContent>
          
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Name"
            type="text"
            autoComplete="off"
            value={this.props.userName}
            onChange={this.props.handleChange}
            onKeyPress={(event) => {
              if(event.charCode===13) {
                this.props.playNow()
              }
             }}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          {this.props.roomID === "" ? <Button onClick={()=>{this.setState({initialDialogOpen: false, createRoomOpen: true, roomName: Math.random().toString(36).substring(2, 15)})}} color="primary">
          Create Room
          </Button> : <></>}
          <Button onClick={()=>{this.props.playNow()}} color="primary">
          {this.props.roomID === "" ? "Play Now" : ("Join Room " + this.props.roomID)}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={this.state.createRoomOpen} onClose={()=>{this.setState({initialDialogOpen: true, createRoomOpen: false})}} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Choose a Room Name</DialogTitle>
        <DialogContent>
          
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Room Name"
            type="text"
            autoComplete="off"
            value={this.state.roomName}
            onChange={(event) => {this.setState({roomName: event.target.value})}}
            onKeyPress={(event) => {
              if(event.charCode===13) {
                this.props.createRoom(this.state.roomName)
              }
             }}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          {this.props.roomID === "" ? <Button onClick={()=>{this.props.createRoom(this.state.roomName)}} color="primary">
          Create Room
          </Button> : <></>}
        </DialogActions>
      </Dialog>


       
      </>
    );
  }
}

export default Main;
