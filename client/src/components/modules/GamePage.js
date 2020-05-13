import React, { Component } from "react";
import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import Question from "./Question.js";
import ScorePage from "./ScorePage.js";
import Timer from "./Timer.js";
import Button from "@material-ui/core/Button";
import Chat from './Chat.js';

import { socket } from "../../client-socket.js";
import { get, post } from "../../utilities";
const Cryptr = require('cryptr');
const cryptr = new Cryptr('cheatingisnotallowed');
class GamePage extends Component {
  // makes props available in this component
  constructor(props) {
    super(props);

    this.state = {
      userID: this.props.userID,
      gameID: this.props.gameID,
      userInfo: {},
      status: "waiting",
      started: false,
      type: "Addition",
      ratingType: "Mental Math",
      theirAnswer: "",
      gameData: {},
      timeLimit: 20,
      questionList: [] /*this.props.questionList, /*[Array(200).fill(new Question({
        statement: "2x3",
        answer: "6"
      }))], // get from props*/,
      currentQuestion: 0,
      host: {},
      hostLeft: false,
      password: "",
      endTime: new Date(3000, 0, 1),
      gameName: "Race",
     
      secondsLeftToStart: 2
    };

  }

  getUserInfo = () => {
    
    
    get("api/getUsers").then((users) => {
      let userInfo = {}
      let counter = 0
      users.forEach((user) => {
        userInfo[user._id] = {
          name: user.name,
          username: user.username,
          displayName: user.displayName,
          ELO: Object.assign({}, user.ELO),
          gameID: user.gameID,
          picture: user.picture,
          highScore: Object.assign({}, user.highScore),
          setUsername: user.setUsername
        }
        counter += 1
        if(counter === users.length) {
          this.setState({userInfo: userInfo})
        }
      })
    })
  }
  setData = () => {
    
    let id = this.state.gameID;
    this.getUserInfo()
    get("api/gameInfo", { gameID: id }).then((result) => {
      console.log("Hello")
      if(result === null) {
        console.log("Helloo")
        post("api/leaveGame").then(() => {
          this.props.updateState({gameID: "Lobby"})
        })
      }
      else {
      this.setState({
        status: result.status,
        gameData: result.gameData,
        type: result.type,
        ratingType: result.ratingType,
        questionList: JSON.parse(window.atob(result.questionList)),
        currentQuestion: result.gameData[this.props.userID].questionNumber,
        endTime: result.endTime,
        timeLimit: result.timeLimit,
        password: result.password,
        host: result.host,
        hostLeft: result.hostLeft,
        gameName: (result.timeLimit < 60 ? "Race" : "Marathon")
      });
      }
    });
    
  }
  componentDidMount() {
    socket.on("getUserInfo", (res) => {
      this.getUserInfo()
    })
    socket.on("setData", (userID) => {
      if(userID == this.state.userID)
        this.setData()
    })
    this.setData()
    socket.on("newPlayer", (user) => {
      if(user.gameID !== this.state.gameID) return;
      let newGameData = this.state.gameData;
      newGameData[user.userID] = {score: 0, questionNumber: 0, name: user.name};
      
      let newUserInfo = this.state.userInfo;
      newUserInfo[user.userID] = user.user;

      this.setState({
        gameData: newGameData,
        userInfo: newUserInfo,
      });
    });

    socket.on("playerLeft", (user) => {
      if(user.gameID !== this.state.gameID) return;
      if(this.state.status === "inProgress" || this.state.status === "finished") {
        
        return
      }
      let newGameData = this.state.gameData;
      delete newGameData[user.userID];
      if(user.userID === this.state.host.userID) {
        this.setState({hostLeft: true})
      }
      this.setState({
        gameData: newGameData
      });
    });
    socket.on("startTimer", (data) => {
      if(data.gameID !== this.state.gameID) return;
      this.setState({
        status: "timer",

      })
      setInterval(() => {this.setState({secondsLeftToStart: Math.floor(((new Date(data.startTime).getTime() - (new Date()).getTime())/1000))})}, 1000)
    })
    socket.on("started", (data) => {
      if(data.gameID !== this.state.gameID) return;
      this.setState({
        status: "inProgress",
        endTime: data.endTime,
      });
    });
    socket.on("scoreUpdate", (update) => {
      if(update.gameID !== this.state.gameID) return;
      this.updateScore(update);
    });

    socket.on("gameFinished", (update) => {
      console.log("FINISH")
      if(update.gameID !== this.state.gameID) return;
      this.setState({
        status: "finished",
      });
    });
  }

  updateScore = (scoreUpdate) => {
    let currentScoreMap = this.state.gameData;
    currentScoreMap[scoreUpdate.userID] = {score: scoreUpdate.score, questionNumber: scoreUpdate.questionNumber, name: currentScoreMap[scoreUpdate.userID].name};
    this.setState({ gameData: currentScoreMap});
  
  };
  render() {
    
    if(Object.keys(this.state.userInfo).length === 0) return <div />
    if(Object.keys(this.state.gameData).length === 0) return <div />
    
    //console.log(this.state.gameData)
    if (this.state.status === "waiting" || this.state.status === "timer") {
      let gameStartingText = "Game Starting in "+(this.state.secondsLeftToStart+1)+" seconds"
      if(this.state.secondsLeftToStart < -1) {
        gameStartingText = "Loading..."
        if(this.state.secondsLeftToStart < -2) {
          gameStartingText = "Refresh the Page"
        }
      }
      let waitingText = this.state.type + " " + this.state.gameName
      return (
        <Grid container direction="row">
          <Box width={"calc(100% - 400px)"} >
          <Grid container direction="column" >
          <h1 style={{display: "flex", justifyContent: "center"}}>{this.state.status === "waiting" ? waitingText : gameStartingText}</h1>

          <ScorePage
            scores={this.state.gameData}
            userInfo={this.state.userInfo}
            userID = {this.state.userID}
            inProgress = {false}
          />
          {(this.state.hostLeft || (this.state.userID === this.state.host.userID)) ? 
          <Button
            color="primary"
            disabled={(this.state.status === "timer") || (this.state.started)}
            onClick={() => {
              post("api/start", { gameID: this.state.gameID, timeLimit: this.state.timeLimit })
              this.setState({started: true})
              /*.then(() => {
                this.setState({ status: "inProgress" });
              });*/
            }}


            
          >
            Start {this.state.gameName}
          </Button> : ""}
          <Button
            onClick={() => {
              post("api/leaveGame", { gameID: this.state.gameID }).then(() => {
                this.props.updateState({ gameID: "Lobby" });
              });
            }}
          >
            Leave {this.state.gameName}
          </Button>
          
        </Grid>
        </Box>
        <Box width={"400px"} height={1}>
        <Chat messages = {this.props.chat} gameID = {this.state.gameID} />
        </Box>
        </Grid>
      );
    }

    let currentQuestion = { statement: "Loading...", answer: "Haeeaw234234wr" };
    if (this.state.questionList.length !== 0) {
      if(this.state.currentQuestion >= this.state.questionList.length) {
        currentQuestion= {statement: "You ran out of questions", answer: "@(1983)284970973!!!(#328948134893@#$@%#"}
      }
      currentQuestion = this.state.questionList[this.state.currentQuestion];
    }
      let submitAnswer = (answer) => {
        let scoreIncrease = (answer === currentQuestion.answer ? 1 : 0);
        let newScore = this.state.gameData[this.state.userID].score + scoreIncrease;
                let newQuestionNumber = this.state.currentQuestion + 1;
                this.updateScore({ userID: this.state.userID, score: newScore, questionNumber: newQuestionNumber});
                post("api/answeredQuestion", { scoreIncrease: scoreIncrease, gameID: this.state.gameID, userID: this.state.userID });
                this.setState({
                  currentQuestion:  newQuestionNumber
                })
      }
    if (this.state.status === "finished") {
      return (
        <Grid container direction="row">
          <Box width="calc(100% - 400px)">
          <Grid container direction="column">
          <h1 style={{display: "flex", justifyContent: "center"}}>Results</h1>
          <ScorePage
            scores={this.state.gameData}
            userInfo={this.state.userInfo}
            userID = {this.state.userID}
            inProgress = {false}
          />
          <Button
            onClick={() => {
              post("api/leaveGame", { gameID: this.state.gameID }).then(() => {
                this.props.updateState({ gameID: "Lobby" });
              });
              post("api/chat", {message: "[NAME] left the game", gameID: this.props.gameID, systemMessage: true})
            }}
          >
            Leave {this.state.gameName}
          </Button>
          
        </Grid>
        </Box>
        <Box width={"400px"} height={1}>
        <Chat messages = {this.props.chat} gameID = {this.state.gameID} />
        </Box>

        </Grid>
       
      );
    }
    return (
      <Grid container direction="column">
        <Timer
          endTime={this.state.endTime}
          gameID ={this.state.gameID}
          host = {this.state.host}
          userID = {this.state.userID}
          gameData = {this.state.gameData}
          ratingType = {this.state.ratingType}
          finish={() => {
              this.setState({ status: "finished" })
              // this will post 10 times (maybe we sohuld make only the host do this?)
           
            
          }}
        />
        <Question question={currentQuestion} />
        <TextField
          id="filled-basic"
          label="Answer"
          variant="filled"
          autoFocus
          disabled={this.state.questionList.length <= this.state.currentQuestion}
          autoComplete='off' 
          value={this.state.theirAnswer}
          onChange={(event) => {
            if (event.target.value === currentQuestion.answer) {
              submitAnswer(event.target.value)
              this.setState({
               
                theirAnswer: "",
              });
            } else {
              this.setState({ theirAnswer: event.target.value });
            }
          }}
          onKeyPress = {(event) => {
            if(event.charCode === 13) {
              /*
              submitAnswer(this.state.theirAnswer)
              this.setState({
               
                theirAnswer: "",
              });
              */
            }
          }}
        />
        <ScorePage scores={this.state.gameData} userInfo={this.state.userInfo}  userID = {this.state.userID} inProgress = {true} />
        
        <Button
          onClick={() => {
            post("api/chat", {message: "[NAME] left the game", gameID: this.props.gameID, systemMessage: true})
            post("api/leaveGame", { gameID: this.state.gameID }).then(() => {
              this.props.updateState({ gameID: "Lobby" });
            });
          }}
        >
          Leave {this.state.gameName}
        </Button>
      </Grid>
    );
  }
}

export default GamePage;
