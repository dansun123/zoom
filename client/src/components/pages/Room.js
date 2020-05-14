import React, { Component } from "react";
import sound from "../images/RadioWaves.png";
import silent from "../images/RadioNoWaves.png";
import Chat from '../modules/Chat.js';


import "../../utilities.css";
import "./Main.css";
import { withRouter } from "react-router-dom";
import { get } from "mongoose";

class Room extends Component {
    constructor(props) {
        super(props);
        this.state = {
            roomid: this.props.computedMatch.params.id,
            gameID: "haha"
        }
    }
    componentDidMount() {
        let roomID = window.location.href.substring( window.location.href.length - 6);
    }

    render() {
        return (
            <>
                <h3>RoomID: {this.state.roomid}</h3>
                <img src = {silent}></img>
            </>
        );
        
    }
}

export default withRouter(Room);