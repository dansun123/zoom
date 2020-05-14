import React, { Component } from "react";
import sound from "../images/RadioWaves.png";
import silent from "../images/RadioNoWaves.png";
import Chat from '../modules/Chat.js';


import "../../utilities.css";
import "./Main.css";
import { withRouter } from "react-router-dom";
import { get, post } from "../../utilities";

class Room extends Component {
    constructor(props) {
        super(props);
        this.state = {
            roomID: this.props.computedMatch.params.id,
            users: [{_id: "2342", name: "Dan"}]
        }
    }
    componentDidMount() {
        post("/api/joinRoom", {roomID: roomID}).then((res) => {

        }) 
    }

    render() {
        return (
            <>
                <h3>RoomID: {this.state.roomID}</h3>
                <img src = {silent}></img>
                <Chat messages={this.props.chat} roomID={this.state.roomID} />

            </>
        );
        
    }
}

export default withRouter(Room);