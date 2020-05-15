import React, { Component } from 'react'
import Button from "@material-ui/core/Button";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import TextField from "@material-ui/core/TextField";
import { get, post } from "../../utilities";


class SongQueue extends React.Component {
    constructor(props) {
        super(props);
        this.state = { 
            messageText:'',
            lastMessage: new Date(),
        }
    }

    handleChange = event => {
        this.setState({ messageText: event.target.value });
    };

    handleSubmit = event => {
        event.preventDefault();
        // this.sendMessage();
        post("/api/newSongReq", {newSong: this.state.messageText, roomID: this.props.roomID}).then(() => {
            this.setState({ messageText: ""})
        });
    };

    render() {
        let songQueue = this.props.queue.map((title) => {
            return <ListItem><ListItemText primary={title}/></ListItem>
        })
      return (
        <>
            <h3>Song Queue</h3>
            {songQueue}
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
        </>
      );
    }
  }
  
  export default SongQueue;