import React, { Component } from 'react'
import Button from "@material-ui/core/Button";
import AudioDataContainer from "./AudioDataContainer"
import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import waves from "../images/RadioWaves.png";


class Music extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            play: true,
            audio: new Audio()
        }
        this.state.audio.crossOrigin = "anonymous";
        this.state.audio.src = this.props.url;
    }
  
    componentDidMount() {
      this.state.audio.addEventListener('ended', () => this.setState({ play: false }));
      this.state.audio.volume = 0.1
      this.state.audio.play()

      setTimeout(() => this.state.audio.pause(), 30000)
      
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
          
          {/* <a href = {this.props.url}>SONGURL</a> */}
          </Grid>
          {this.props.pauseButton ? <Button onClick={this.togglePlay} fullWidth >{this.state.play ? 'Pause' : 'Play'}</Button> : ""}
        </>
      );
    }
  }
  
  export default Music;