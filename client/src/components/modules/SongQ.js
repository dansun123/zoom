import React, { Component } from 'react'
import Button from "@material-ui/core/Button";
import Box from "@material-ui/core/Box";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import TextField from "@material-ui/core/TextField";
import Autocomplete from '@material-ui/lab/Autocomplete';

import { get, post } from "../../utilities";


class SongQueue extends React.Component {
    constructor(props) {
        super(props);
        this.state = { 
            messageText:'',
            lastMessage: new Date(),
            songOptions: [],
            song: null
        }
    }

    componentDidMount() {
        get("/api/songs").then((songs) => {
            this.setState({songOptions: songs})
        })
    }

    handleChange = (event, value) => {
        console.log(value)
        this.setState({ song: value });
    };

    handleSubmit = event => {
        event.preventDefault();
        // this.sendMessage();
        if(this.state.song === null) return;
        console.log(this.state.song)
        post("/api/newSongReq", {newSong: this.state.song, roomID: this.props.roomID}).then(() => {
            this.setState({ song: null})
        });
    };

    render() {
        let songQueue = this.props.queue.map((song) => {
            return <ListItem><ListItemText primary={song.title + " " + song.primaryArtist}/></ListItem>
        })
      return (
      <Box>
         <Box height={"220px"}  style={{backgroundColor: "#F7F7F7", width: "100%", overflow: "scroll", color: "#678efd", fontWeight: "900",  display: "flex", flexDirection: "column-reverse", marginBottom: "auto"}}>
            <List>{songQueue}</List>
            
        </Box>
        <Autocomplete
  options={this.state.songOptions}
  getOptionLabel={(option) => {return option.title + " " + option.primaryArtist}}
  fullWidth
  value={this.state.song}
  onChange={this.handleChange}
  renderInput={(params) => <TextField {...params} label="Add Song to Queue" variant="outlined" size="small" />}
/>
        <Button
          
        
        size="small"
        fullWidth
        onClick = {(event) => {
           
                if((new Date()).getTime() - ((new Date(this.state.lastMessage)).getTime()) >= 500) {
                    this.setState({lastMessage: new Date()})
                    this.handleSubmit(event)
                }
            
        }}

        >Add</Button>
        </Box>
      );
    }
  }
  
  export default SongQueue;