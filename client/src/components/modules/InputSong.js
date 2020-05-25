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
            get("/api/songKaraoke", {title: response.title+" "+response.primaryArtist}).then((res) => {
                if (res.karaokeUrl!=="HI") {
                    console.log("diff")
                }
                this.setState({
                    title: response.title, 
                    artist: response.primaryArtist,
                    // featuredArtists: response.featuredArtists,
                    artUrl: response.artUrl,
                    instrumentalUrl: response.url,
                    karaokeUrl: res.karaokeUrl!=="HI" ? res.karaokeUrl : response.url,
                })
            })
        })
    };

    handleSubmit = event => {
        event.preventDefault();
        // this.sendMessage();
        let body = {
            title: this.state.title, 
            primaryArtist: this.state.artist,
            // featuredArtists: this.state.featuredArtists,
            artUrl: this.state.artUrl,
            instrumentalUrl: this.state.instrumentalUrl,
            karaokeUrl: this.state.karaokeUrl,
        }
        post("/api/songLink", body).then(() => {
            this.setState({ 
                artist: "", 
                answerKey: "",
                // featuredArtists: undefined,
                artUrl: undefined,
                instrumentalUrl: undefined,
                karaokeUrl: undefined,
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
            {this.state.artUrl ? <img src = {this.state.artUrl} style={{width:"100px", height: "100px"}}/>: null}
            {this.state.instrumentalUrl ? <><Music url = {this.state.instrumentalUrl} pauseButton={true} /><a href={this.state.instrumentalUrl}>URL</a></>: null}
            {this.state.karaokeUrl ? <><Music url = {this.state.karaokeUrl} pauseButton={true} /><a href={this.state.karaokeUrl}>URL</a></>: null}
            <button onClick = {() => {
                this.setState({instrumentalUrl: this.state.karaokeUrl})
            }}> Replace Instrumental
            </button>
            <button onClick = {() => {
                this.setState({karaokeUrl: this.state.instrumentalUrl})
            }}> Replace Karaoke
            </button>
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