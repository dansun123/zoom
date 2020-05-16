import React, { Component } from 'react'
import Button from "@material-ui/core/Button";

class Music extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            play: true,
            audio: new Audio(this.props.url)
        }
    }
  
    componentDidMount() {
      this.state.audio.addEventListener('ended', () => this.setState({ play: false }));
      this.state.audio.volume = 0.3
      this.state.audio.play()
      
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
      //console.log("Song URL: " + this.props.url)
      return (
        <>
          <Button onClick={this.togglePlay} fullWidth >{this.state.play ? 'Pause' : 'Play'}</Button>
          {/*<a href = {this.props.url}>SONGURL</a>*/}

        </>
      );
    }
  }
  
  export default Music;