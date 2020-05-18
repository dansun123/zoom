import React, { Component } from 'react'
import Button from "@material-ui/core/Button";
import Box from "@material-ui/core/Box";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import TextField from "@material-ui/core/TextField";
import { get, post } from "../../utilities";

import Music from "./Music";

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
                // featuredArtists: response.featuredArtists,
                artUrl: response.artUrl,
                id: response.id,
                songUrl: response.url,
                embedContent: response.embedContent,
            })
        })
    };

    handleSubmit = event => {
        event.preventDefault();
        // this.sendMessage();
        let body = {
            answerKey: this.state.answerKey, 
            title: this.state.title, 
            primaryArtist: this.state.artist,
            // featuredArtists: this.state.featuredArtists,
            artUrl: this.state.artUrl,
            geniusID: this.state.id,
            songUrl: this.state.songUrl,
            embedContent: this.state.embedContent
        }
        post("/api/songLink", body).then(() => {
            this.setState({ 
                title: "", 
                artist: "", 
                answerKey: "",
                // featuredArtists: undefined,
                artUrl: undefined,
                id: undefined,
                songUrl: undefined,
                embedContent: undefined,
            })
        });
    };

    render() {
      return (
        <Box>
            {/*<button onClick = {()=>{console.log(this.state)}}>log InputSong state</button>*/}

            <TextField
            label="Title"
            variant="outlined"
            size="small"
            value={this.state.title}
            fullWidth
            onChange={this.handleChangeTitle}
            onKeyPress = {(event) => {
                if(event.charCode === 13) {
                    if((new Date()).getTime() - ((new Date(this.state.lastMessage)).getTime()) >= 500) {
                        this.setState({lastMessage: new Date()})
                        this.handleFetch(event)
                    }
                }
              }}
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
            {this.state.embedContent ? <td dangerouslySetInnerHTML={{__html: this.state.embedContent}} />: null}
            {this.state.artUrl ? <img src = {this.state.artUrl} style={{width:"100px", height: "100px"}}/>: null}
            {this.state.songUrl ? <Music url = {this.state.songUrl} pauseButton={true} />: null}
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