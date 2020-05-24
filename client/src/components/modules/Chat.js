import React, { Component } from "react";
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import List from "@material-ui/core/List";

import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import TextField from "@material-ui/core/TextField";
import { get, post } from "../../utilities";
import { FormHelperText } from "@material-ui/core";
class Chat extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      chatHistory: props.messages,
      messageText: "",
      lastMessage: new Date()
    };
  }
  handleSubmit = event => {
    event.preventDefault();
    // this.sendMessage();
    post("api/newMessage", {message: this.state.messageText, roomID: this.props.roomID, inGame: (this.props.status === "inProgress" && !this.props.answered) , title: this.props.song.title, score: this.props.score, points: (Math.floor(((new Date(this.props.endTime)).getTime() - (new Date()).getTime())/1000.0)), userID: this.props.userID, userName: this.props.userName}).then(() => {
      this.setState({ messageText: ""})
    });
  };
  handleChange = event => {
    this.setState({ messageText: event.target.value });
  };

  getLastFew(number, array) {
    let newArray = []
    for(var i=Math.max(array.length-number, 0); i<array.length; i++) {
      newArray.push(array[i])
    }
    return newArray
  }
  render() {
    let addZero = (i) => {
      if (i < 10) {
        i = "0" + i;
      }
      return i;
    }
    let height="220px"
    let crop = (str) => {
      if(str.length > 140) {
        str = str.substring(0, 140)
        
      }
      return str
    }
    return (
      <Box >
      <Box height={height}  style={{backgroundColor: "#F7F7F7", width: "100%", overflow: "scroll", color: "black", display: "flex", flexDirection: "column-reverse", marginBottom: "auto"}}>
          
            <List>
              {this.getLastFew(50, this.props.messages.filter((message) => {return (message.roomID === this.props.roomID)})).map((message) => {
                let text = <><div style={{display: "inline"}}>{"["+(addZero(new Date(message.timestamp).getHours())) + ":" + (addZero(new Date(message.timestamp).getMinutes())) + "] "}</div><div style={{color: "#678efd", display: "inline", fontWeight: "900"}}>{message.sender.userName}</div><div style={{display: "inline"}}>{": " + crop(message.message)}</div></>
                if(message.systemMessage) {
                  text = message.message
                }


                return (
                  <ListItem dense fullWidth>
                    <ListItemText>{text}</ListItemText>
                  </ListItem>

                )
              })}
            </List>
            
            
      </Box>
      <TextField
          
      label="Message"
      variant="outlined"
      size="small"
      value={this.state.messageText}
      fullWidth
      onChange={this.handleChange}
      onKeyPress = {(event) => {
        if(event.charCode === 13) {

          if((new Date()).getTime() - ((new Date(this.state.lastMessage)).getTime()) >= 500) {
            this.setState({lastMessage: new Date()})
            this.handleSubmit(event)
          }
        }
      }}

      />
      </Box>
    );
  }

};


export default Chat
