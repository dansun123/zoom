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
    post("api/chat", {message: this.state.messageText, gameID: this.props.gameID}).then(() => {
      this.setState({ messageText: ""})
    });
    console.log('submitting message')

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
    //console.log(this.props.messages)
    let height="300px"
    if(this.props.gameID !== "Lobby") height="580px"
    let crop = (str) => {
      if(str.length > 140) {
        str = str.substring(0, 140)
        
      }
      return str
    }
    return (
      <Box height={height}>
      <Box height={height}  style={{backgroundColor: "#F7F7F7", width: "100%", overflow: "scroll", color: "black", display: "flex", flexDirection: "column-reverse", marginBottom: "auto"}}>
          
            <List>
              {this.getLastFew(50, this.props.messages.filter((message) => {return (message.gameID === this.props.gameID)})).map((message) => {
                let text = <><div style={{display: "inline"}}>{"["+(addZero(new Date(message.timestamp).getHours())) + ":" + (addZero(new Date(message.timestamp).getMinutes())) + "] "}</div><div style={{color: "#6c57f5", display: "inline", fontWeight: "900"}}>{message.name}</div><div style={{display: "inline"}}>{": " + crop(message.message)}</div></>
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
