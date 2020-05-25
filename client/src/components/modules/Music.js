import React, { Component } from 'react'
import Button from "@material-ui/core/Button";
import AudioDataContainer from "./AudioDataContainer"
import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import waves from "../images/RadioWaves.png";

import { socket } from "../../client-socket.js";
class Music extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            play: false,
            audio: new Audio()
        }
        this.state.audio.crossOrigin = "anonymous";
        this.state.audio.src = this.props.url;
    }
  
    componentDidMount() {
      this.state.audio.addEventListener('ended', () => this.setState({ play: false }));
      this.state.audio.volume = 0.1
      this.state.audio.pause()
      socket.on("startGame", (data) => {
        this.setState({play: true}, () => {
          this.state.play ? this.state.audio.play() : this.state.audio.pause();
        })
      })

      socket.on("finishGame", (data) => {
        this.setState({play: false}, () => {
          this.state.play ? this.state.audio.play() : this.state.audio.pause();
        })
      })

      socket.on("results", (data) => {
        this.setState({play: false}, () => {
          this.state.play ? this.state.audio.play() : this.state.audio.pause();
        })
      })
     // setTimeout(() => this.state.audio.pause(), 30000)
      
    }
  
    componentDidUpdate(prevProps) {
      if(prevProps.url !== this.props.url) {
        this.state.audio.src = this.props.url;
        
      }
    }
    componentWillUnmount() {
      this.state.audio.removeEventListener('ended', () => this.setState({ play: false }));  
    }
  
    togglePlay = () => {
      this.setState({ play: !this.state.play }, () => {
        this.state.play ? this.state.audio.play() : this.state.audio.pause();
      });
    }
    
    render() {
      return (
        <>
          <Grid container direction="column" style={{padding: "10px 10px 10px 10px"}}>
          {/* <div>pre</div> */}
          
          <Box height={"130px"}></Box>
          
          {this.props.visual ? <AudioDataContainer audio = {this.state.audio} /> : <img src = {waves} style={{width: "100px"}}/>}
          {/* <div>post</div> */}
          {this.props.pauseButton ? <Button onClick={this.togglePlay} fullWidth >{this.state.play ? 'Pause' : 'Play'}</Button> : ""}

          {/* <a href = {this.props.url}>SONGURL</a> */}
          </Grid>
        </>
      );
    }
  }
  
  export default Music;