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

import Box from "@material-ui/core/Box";
import Slide from '@material-ui/core/Slide';
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import MenuItem from "@material-ui/core/MenuItem";


import NotFound from "./NotFound"
import Music from "../modules/Music"
import "../../utilities.css";
import "./Main.css";
import { withRouter } from "react-router-dom";
import { get, post } from "../../utilities";
import { socket } from "../../client-socket.js";
import ScorePage from "../modules/ScorePage";

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
            users: undefined,
            status: "waitingToFinish",
            isLoading: true,
            songlink: "https://audio-ssl.itunes.apple.com/apple-assets-us-std-000001/AudioPreview71/v4/d7/f3/c5/d7f3c5c3-c38d-34e0-be13-4b4263af8847/mzaf_1361022562394107098.plus.aac.p.m4a"
        }
    }
    componentDidMount() {
        post("/api/joinRoom", {roomID: this.state.roomID}).then((data) => {
            console.log(this.state.roomID)
            this.setState({users: data.userList})
            this.setState({isLoading: false})
            if((data.status === "inProgress") || (data.status === "timer")) {
                this.setState({status: "waitingToFinish"})
            }
            else {
                this.setState({status: "waitingToStart"})
            }
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

        socket.on("updateGameScore", (update) => {
            
        })

        socket.on("startTimer", (data) => {
            this.setState({status: "timer"})

        })

        socket.on("inProgress", (data) => {
            if(this.state.status === "timer") {
                this.setState({status: "inProgress"})
            }

        })

        socket.on("finished", (data) => {
            this.setState({status: "finished"})
        })

    }

    render() {
        if(this.state.isLoading) {
            return <>
            <h1>Loading...</h1>
            </>
        }

        if(!this.state.users) {
            return <>
            <button onClick = {()=>{console.log(this.state)}}>log room state</button>
            <NotFound/>
            </>
        }

        let blankGameData = this.state.users.map((user) => {
            return {userId: user.userId, userName: user.userName, score: 0}
        })
        
        let body = <></>
        if(this.state.status === "waitingToFinish") {
            body = <h1>Waiting for Game to Finish</h1>
           
        }
        else if(this.state.status === "waitingToStart") {
            body = 
            <>
            <h1>Waiting to Start</h1> 
            <ScorePage gameData = {blankGameData} userId = {this.props.userId} />
            <Button fullWidth onClick={() => {post("/api/startGame")}}>Start Game</Button>
            </>
        }
        else if(this.state.status === "timer") {


        }
        else if(this.state.status === "inProgress") {
           

        }
        else {
            // should never happen
            body = <h1>Theres  a bug</h1>
        }

        return (
            <>
                <button onClick = {()=>{console.log(this.state)}}>log room state</button>
                <h3>Invite Link: {window.location.href}</h3>
                {/*<img src = {silent}></img>*/}
                {body}
                <Chat messages={this.props.chat} roomID={this.state.roomID} />
                <Music url = {this.state.songlink}></Music>
            </>
        );
        
    }
}

export default withRouter(Room);