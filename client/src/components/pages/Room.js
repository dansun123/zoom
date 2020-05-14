import React, { Component } from "react";
import sound from "../images/RadioWaves.png";
import silent from "../images/RadioNoWaves.png";
import Chat from '../modules/Chat.js';


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
            roomID: this.props.computedMatch.params.id,
            users: []
        }
    }
    componentDidMount() {
        post("/api/joinRoom", {roomID: this.state.roomID}).then((userList) => {
            this.setState({users: userList})
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
        return (
            <>
                <button onClick = {()=>{console.log(this.state)}}>log room state</button>
                <h3>RoomID: {this.state.roomID}</h3>
                <h3>Invite Link: {"https://djzoomer.herokuapp.com/"+this.state.roomID}</h3>
                <img src = {silent}></img>
                <Chat messages={this.props.chat} roomID={this.state.roomID} />
            </>
        );
        
    }
}

export default withRouter(Room);