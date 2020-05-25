import React, { Component } from "react";
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom' 
import instruments from "../../public/instruments.js"
import sound from "../images/RadioWaves.png";
import silent from "../images/RadioNoWaves.png";
import Chat from '../modules/Chat.js';
import Avatar from "@material-ui/core/Avatar";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Select from "@material-ui/core/Select";
import IconButton from '@material-ui/core/IconButton';
import Dialog from "@material-ui/core/Dialog";
import List from "@material-ui/core/List";
import {CopyToClipboard} from 'react-copy-to-clipboard';

import Box from "@material-ui/core/Box";
import Slide from '@material-ui/core/Slide';
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import MenuItem from "@material-ui/core/MenuItem";
// import "../modules/Audio.js";

import SongQueue from "../modules/SongQ"
import Timer from "../modules/Timer"
import NotFound from "./NotFound"
import Music from "../modules/Music"
import "../../utilities.css";
import "./Main.css";
import { withRouter } from "react-router-dom";
import { get, post } from "../../utilities";
import { socket } from "../../client-socket.js";
import ScorePage from "../modules/ScorePage";
import ReactPiano from "../modules/ReactPiano"
// import "../stylesheets/Audio.css";
// import "../stylesheets/Audio.scss";

class Room extends Component {
    constructor(props) {
        super(props);
        this.state = {
            status: "waitingToFinish",
            score: 0,
      
            isLoading: true,
            endTime: new Date(),
            answered: false,
            startTime: new Date(),
            song: {title: "hi", primaryArtist: "hi", artUrl: "", karaokeUrl: "https://audio-ssl.itunes.apple.com/apple-assets-us-std-000001/AudioPreview71/v4/d7/f3/c5/d7f3c5c3-c38d-34e0-be13-4b4263af8847/mzaf_1361022562394107098.plus.aac.p.m4a", instrumentalUrl: "https://audio-ssl.itunes.apple.com/apple-assets-us-std-000001/AudioPreview71/v4/d7/f3/c5/d7f3c5c3-c38d-34e0-be13-4b4263af8847/mzaf_1361022562394107098.plus.aac.p.m4a"},
            timeToStart: 3,
            roomData: [],
            redirect: false,
            refresh: false,
            copied: false,
            
        }
    }
    componentDidMount() {
        if(this.props.socketid !== "") {
        post("/api/joinRoom", {socketid: this.props.socketid, roomID: this.props.roomID, userID: this.props.userID, userName: this.props.userName}).then((data) => {
            if(data.exists)
                 this.setState({roomID: data.roomID, roomData: data.roomData, status: (data.status === "inProgress" ? "waitingToFinish" : data.status), isLoading: false})
            else {
                this.setState({isLoading: false, status: "doesNotExist"})
            }
        }) 
        }

       

        socket.on("removeUser", (user) => {
            if(user.roomID !== this.props.roomID) return;
            let data = this.state.roomData 
            data = data.filter((entry) => {return entry.userID !== user.userID})
            this.setState({roomData: data})
         
        })
        socket.on("someoneJoinedRoom", (user) => {
            if(user.roomID !== this.props.roomID) return;
            let data = this.state.roomData
            data.push({userID: user.userID, userName: user.userName, score: 0})
            this.setState({roomData: data})
        })

        socket.on("updateRoomData", (update) => {
            if(update.roomID !== this.props.roomID) return;
            let arr = this.state.roomData
            arr = arr.filter((obj) => {return obj.userID !== update.entry.userID})
            arr.push(update.entry)
            this.setState({roomData: arr})
            if(update.entry.userID === this.props.userID) this.setState({score: update.entry.score, answered: true})
        })

        socket.on("startTimer", (data) => {
            if(this.props.roomID !== data.roomID) return;
            let newdata = this.state.roomData 
            let i = 0
            for(i=0; i<newdata.length; i++) newdata[i].score = 0 
                
            this.setState({
                status: "timer", 
                endTime: data.endTime, 
                startTime: data.startTime, 
                roomData: newdata,
                song: data.song,
                score: 0,
                roundNum: data.roundNum
            })

            let counter = 0
            var interval = setInterval(() => {
                let timeToStart = Math.floor(((new Date(data.startTime).getTime() - (new Date()).getTime())/1000.0)+1.0)
                this.setState({timeToStart: timeToStart})
                counter += 1
                if(counter === 6) {
                    clearInterval(interval)
                }
            
            }, 1000)

        })

        socket.on("startGame", (data) => {
            if(this.props.roomID !== data.roomID) return;
            this.setState({roundNum: data.roundNum, status: "inProgress", answered: false})
          

        })

        socket.on("finishGame", (data) => {
            if(this.props.roomID !== data.roomID) return;
            
               
            this.setState({
                status: "gameFinished", 
                endTime: data.endTime, 
                startTime: data.startTime, 
                song: data.song,
                answer: data.answer,
   
                timeToStart: 5
                
            })

            let counter = 0
            var interval = setInterval(() => {
                let timeToStart = Math.floor(((new Date(data.startTime).getTime() - (new Date()).getTime())/1000.0)+1.0)
                this.setState({timeToStart: timeToStart})
                counter += 1
                if(counter === 6) {
                    clearInterval(interval)
                }
            
            }, 1000)
        })


        socket.on("results", (data) => {
            if(this.props.roomID !== data.roomID) return;
            
               
            this.setState({
                status: "roundFinished", 
                answer: data.answer
            })

        })

        socket.on("disconnect", () => {
            this.setState({refresh: true})
                
            
        })

        socket.on("inactive", (data) => {
            if(data.userID === this.props.userID) {
                this.setState({redirect: true})
            }
        })
    }

    componentDidUpdate(prevProps) {
        if((this.props.roomID !== prevProps.roomID) || (this.props.socketid !== prevProps.socketid)) {
            post("/api/joinRoom", {socketid: this.props.socketid, roomID: this.props.roomID, userID: this.props.userID, userName: this.props.userName}).then((data) => {
                if(data.exists)
                     this.setState({roomID: data.roomID, roomData: data.roomData, status: (data.status === "inProgress" ? "waitingToFinish" : data.status), isLoading: false})
                else {
                    this.setState({isLoading: false, status: "doesNotExist"})
                }
            }) 
        }
    }

    render() {
        
        if(this.state.redirect) {
            return <Redirect to="/" />
        }
        if(this.state.refresh) {
            return <Redirect to={"/"+this.props.roomID} />
        }
        if(this.state.isLoading) {
            return <>
            <h1>Loading...</h1>
            </>
        }

        let body = <></>
        if(this.state.status === "waitingToFinish") {
            body = <h1>Waiting for Game to Finish</h1>
           
        }
        else if(this.state.status === "waiting") {
            
            body = 
            <>
            
            <h2 style={{display: "flex", justifyContent: "center"}}>Waiting to Start</h2> 
            <ScorePage roomData = {this.state.roomData} userID = {this.props.userID} />
            <Button fullWidth onClick={() => {post("/api/startGame", {roomID: this.props.roomID})}}>Start Game</Button>
            </>
        }
        else if(this.state.status === "timer") {
            body = 
            <>
            <h2 style={{display: "flex", justifyContent: "center"}}>Game starting in {this.state.timeToStart} seconds</h2>
            <ScorePage roomData = {this.state.roomData} userID = {this.props.userID} />
            </>

        }
        else if(this.state.status === "inProgress") {
            body = 
            <>
            
            <Timer endTime={this.state.endTime} />
            <ScorePage roomData = {this.state.roomData} userID = {this.props.userID} />
            </>

        }
        else if(this.state.status === "gameFinished") {
            body = 
            <>
            {(this.state.answer) ? 
            <h2 style={{display: "flex", justifyContent: "center"}}>{"Answer: " + this.state.answer.title + " by " + this.state.answer.primaryArtist}</h2>
            : <></>}
            <ScorePage roomData = {this.state.roomData} userID = {this.props.userID} />
            
            <h3 style={{display: "flex", justifyContent: "center"}}>Next Round in {this.state.timeToStart} seconds</h3>
           
            </>
        }
        else if(this.state.status === "roundFinished") {
            body = 
            <>

            <h2 style={{display: "flex", justifyContent: "center"}}>Final Results</h2>
            <ScorePage roomData = {this.state.roomData} userID = {this.props.userID} />
            {(this.state.answer) ? 
            <h2 style={{display: "flex", justifyContent: "center"}}>{"Answer: " + this.state.answer.title + " by " + this.state.answer.primaryArtist}</h2>
            : <></>}            
            <Button fullWidth onClick={() => {post("/api/startGame", {roomID: this.props.roomID})}}>Start New Game</Button>
            </>

        }
        else if(this.state.status === "doesNotExist") {
            body = 
          

            <h2 style={{display: "flex", justifyContent: "center"}}>This Room Does Not Exist Yet</h2>
            

        }
        else {
            // should never happen
            body = <h1>Theres  a bug</h1>
        }
        let url = window.location.href
            if(url.charAt(url.length - 1) === '/') url += this.props.roomID
        return (
            <>
                
                 <Grid container direction="row">
                 <Box width={"calc(100% - 400px)"} >
                     {body}
                </Box>
                <Box width={"400px"} >
               
   
                     

                    {window.AudioContext ? <Box style={{height: "260px", overflow: scroll}}>
                <Music url = {this.state.song.instrumentalUrl} visual={true} pauseButton={false}></Music>
            </Box> : <></>}
            <Chat endTime={this.state.endTime} messages={this.props.chat} roomID={this.props.roomID} status={this.state.status} answered={this.state.answered} song={this.state.song} userName={this.props.userName} userID={this.props.userID} score={this.state.score} />
            <h3 style={{display: "flex", justifyContent: "center", alignItems: "center"}}> 
                    Invite Link: {url}
                   
                 </h3>
                  <CopyToClipboard text={url}
                        onCopy={() => {this.setState({copied:true})}}>
                        {!this.state.copied ? 
                            <Button fullWidth className = "button2">Copy to clipboard</Button>
                            : <Button fullWidth className = "button2">Copied to clipboard!</Button>
                        }
                    </CopyToClipboard>
                </Box>
                </Grid>
                
                
            </>
        );
        
    }
}

export default Room;