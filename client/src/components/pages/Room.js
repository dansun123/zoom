import React, { Component } from "react";
import sound from "../images/RadioWaves.png";
import silent from "../images/RadioNoWaves.png";
import Chat from '../modules/Chat.js';
import Avatar from "@material-ui/core/Avatar";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import Select from "@material-ui/core/Select";
import IconButton from '@material-ui/core/IconButton';
import Dialog from "@material-ui/core/Dialog";
import List from "@material-ui/core/List";
import CloseIcon from '@material-ui/icons/Close';
import Box from "@material-ui/core/Box";
import Slide from '@material-ui/core/Slide';
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import MenuItem from "@material-ui/core/MenuItem";


import NotFound from "./NotFound"
import "../../utilities.css";
import "./Main.css";
import { withRouter } from "react-router-dom";
import { get, post } from "../../utilities";
import { socket } from "../../client-socket.js";

function containsObject(obj, list) {
    var i;
    for (i = 0; i < list.length; i++) {
        if (list[i].userId === obj.userId) {
            return true;
        }
    }

    return false;
}
class Room extends Component {
    constructor(props) {
        super(props);
        this.state = {
            roomID: String(this.props.computedMatch.params.id),
            users: []
        }
    }
    componentDidMount() {
        post("/api/joinRoom", {roomID: this.state.roomID}).then((userList) => {
            console.log(this.state.roomID)
            this.setState({users: userList})
            console.log("Bi")
        }) 
        socket.on("someoneJoinedRoom", (user) => {
            let newUsers  = this.state.users;
            if(!containsObject(user, newUsers) && user.userId !== this.props.userId) {
                newUsers.push(user)
                this.setState({
                    users: newUsers
                })
            }
        })
    }

    render() {
        if(!this.state.users) {
            return <>
            <button onClick = {()=>{console.log(this.state)}}>log room state</button>
            <NotFound/>
            </>
        }

        let connectedUsers = this.state.users.map((user) => {
            return <ListItem><ListItemText primary={user.userName}/></ListItem>
        })
        return (
            <>
                <button onClick = {()=>{console.log(this.state)}}>log room state</button>
                <h3>RoomID: {this.state.roomID}</h3>
                <h3>Invite Link: {window.location.href}</h3>
                <img src = {silent}></img>
                <Chat messages={this.props.chat} roomID={this.state.roomID} />
                <br></br>
                <br></br>
                <br></br><br></br>
                <Box height={"360px"} style={{overflow: "scroll" }}>
                    <List>
                    {connectedUsers}
                    </List>
                </Box>
            </>
        );
        
    }
}

export default withRouter(Room);