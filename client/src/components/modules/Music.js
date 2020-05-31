import React, { Component } from 'react'
import Button from "@material-ui/core/Button";
import AudioDataContainer from "./AudioDataContainer"
import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import waves from "../images/RadioWaves.png";
import ReactPlayer from 'react-player'

import { socket } from "../../client-socket.js";
class Music extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            play: this.props.autoplayMusic,
            audio: new Audio(),
            changedOnce: false
        }
        this.state.audio.crossOrigin = "anonymous";
        this.state.audio.src = this.props.url + "?cb=" + new Date().getTime()
    }
  
    componentDidMount() {
      this.state.audio.addEventListener('ended', () => this.setState({ play: false }));
      this.state.audio.volume = 0.1
      this.props.autoplayMusic ? this.state.audio.play() : this.state.audio.pause()
      socket.on("startGame", (data) => {
        if(this.props.roomID !== data.roomID) return;
       
        this.setState({play: true}, () => {
          this.state.play ? this.state.audio.play() : this.state.audio.pause();
        })
      })

      socket.on("finishGame", (data) => {
        if(this.props.roomID !== data.roomID) return;
        this.setState({play: false}, () => {
          this.state.play ? this.state.audio.play() : this.state.audio.pause();
        })
      })

      socket.on("results", (data) => {
        if(this.props.roomID !== data.roomID) return;
        this.setState({play: false}, () => {
          this.state.play ? this.state.audio.play() : this.state.audio.pause();
        })
      })
     // setTimeout(() => this.state.audio.pause(), 30000)
      
    }
  
    componentDidUpdate(prevProps) {
      if(prevProps.url !== this.props.url) {
        this.state.audio.src = this.props.url + "?cb=" + new Date().getTime();
        
      }
    }
    componentWillUnmount() {
      this.state.audio.removeEventListener('ended', () => this.setState({ play: false }));  
    }
  
    togglePlay = () => {
      this.setState({ play: !(this.state.play && this.state.changedOnce), changedOnce: true }, () => {
        this.state.play ? this.state.audio.play() : this.state.audio.pause();
      });
    }
    
    render() {
      return (
        <>
          <Grid container direction="column">
          {/* <div>pre</div> */}
          
          <Box height={this.props.visual ? "130px" : "0px"}></Box>
          
          {this.props.visual ? <AudioDataContainer audio = {this.state.audio} /> : <img src = {waves} style={{width: "100%"}}/>}
          {/* {this.props.pauseButton ? <ReactPlayer url={this.props.url} playing={this.state.play} controls/> : <ReactPlayer url={this.props.url} playing={this.state.play} width={'0%'} height={'0%'}/>} */}
          {/* <div>post</div> */}
          {this.props.pauseButton ? <Button onClick={this.togglePlay} fullWidth >{this.state.play && this.state.changedOnce ? 'Pause' : 'Play'}</Button> : ""}

          {/* <a href = {this.props.url}>SONGURL</a> */}
          </Grid>
        </>
      );
    }
  }
  
  export default Music;