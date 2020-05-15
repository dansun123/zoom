import React, { Component } from 'react'
import Button from "@material-ui/core/Button";
import Box from "@material-ui/core/Box";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import TextField from "@material-ui/core/TextField";
import { get, post } from "../../utilities";

import Music from "./Music";

let API_KEY = "f5175382b7863a5e3c01a3b0981b2529";

class InputSong extends React.Component {
    constructor(props) {
        super(props);
        this.state = { 
            title: "",
            artist: "",
            answerKey: "",
            lastMessage: new Date(),
        }
    }

    handleChangeTitle = event => {
        this.setState({ title: event.target.value });
    };

    handleChangeArtist = event => {
        this.setState({ artist: event.target.value });
    };

    handleChangeAnswerKey = event => {
        this.setState({ answerKey: event.target.value });
    };

    handleFetch = event => {
        event.preventDefault();
        // this.sendMessage();
        get("/api/songLyrics", {title: this.state.title, artist: this.state.artist}).then((response) => {
            this.setState({
                answerKey: response.answerKey, 
                title: response.title, 
                artist: response.primaryArtist,
                featuredArtists: response.featuredArtists,
                artUrl: response.artUrl,
                id: response.id,
                songUrl: response.url,
            })
            // console.log("track.lyrics.get?apikey="+API_KEY+"&track_id="+response.track_id)
        })
    };

    handleSubmit = event => {
        event.preventDefault();
        // this.sendMessage();
        post("/api/songLink", {answerKey: this.state.answerKey, title: this.state.title, artist: this.state.artist}).then(() => {
            this.setState({ title: "", artist: "", answerKey: ""})
        });
    };

    render() {
      return (
        <Box>
                    <button onClick = {()=>{console.log(this.state)}}>log InputSong state</button>

            <TextField
            label="Title"
            variant="outlined"
            size="small"
            value={this.state.title}
            fullWidth
            onChange={this.handleChangeTitle}
            />
            <div>by</div>
            <TextField
            label="Artist"
            variant="outlined"
            size="small"
            value={this.state.artist}
            fullWidth
            onChange={this.handleChangeArtist}
            />
            <button onClick = {() => {
                if(true) {
                    if((new Date()).getTime() - ((new Date(this.state.lastMessage)).getTime()) >= 500) {
                        this.setState({lastMessage: new Date()})
                        this.handleFetch(event)
                    }
                }
            }}> Fetch
            </button>
            {this.state.featuredArtists ? <div>Featuring {this.state.featuredArtists}</div>: null}
            {this.state.artUrl ? <img src = {this.state.artUrl} style={{width:"100px", height: "100px"}}/>: null}
            {this.state.songUrl ? <Music url = {this.state.songUrl}/>: null}
            <TextField
            label="AnswerKey"
            variant="outlined"
            size="large"
            value={this.state.answerKey}
            fullWidth
            multiline = {true}
            onChange={this.handleChangeAnswerKey}
            />
            <button onClick = {() => {
                if(true) {
                    if((new Date()).getTime() - ((new Date(this.state.lastMessage)).getTime()) >= 500) {
                        this.setState({lastMessage: new Date()})
                        this.handleSubmit(event)
                    }
                }
            }}> Submit
            </button>
        </Box>
      );
    }
  }
  
  export default InputSong;