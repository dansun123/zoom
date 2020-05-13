import React, { Component, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Avatar from "@material-ui/core/Avatar";
import GoogleLogin, { GoogleLogout } from "react-google-login";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import Select from "@material-ui/core/Select";
import IconButton from '@material-ui/core/IconButton';
import ScorePage from "./ScorePage.js";
import Dialog from "@material-ui/core/Dialog";
import List from "@material-ui/core/List";
import CloseIcon from '@material-ui/icons/Close';
import Box from "@material-ui/core/Box";
import Chat from "./Chat.js";
import Slide from '@material-ui/core/Slide';
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import MenuItem from "@material-ui/core/MenuItem";
import { get, post } from "../../utilities";
import "../../utilities.css";

//TODO: REPLACE WITH YOUR OWN CLIENT_ID
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const useStyles = makeStyles(theme => ({
  appBar: {
    position: 'relative',
  },
  root: {
    display: "flex",
    backgroundColor: "#6c57f5"
  // backgroundImage: "linear-gradient(to right, #070707, #6c57f5)",
    
  },

 
  title: {
    fontWeight: "bold",
    
    color: "white",
  },


}));

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});
export default function SideBar(props) {
  const classes = useStyles();
  const [canCreateGames, setCanCreateGames] = useState(true)
  const [clickedLogout, setClickedLogout] = useState(false)
  const [modal, setModal] = useState(false)
  const [scoresRace, setScoresRace] = useState({})
  const [scoresMarathon, setScoresMarathon] = useState({})
  let gameTypes = [{type: "Addition", ratingType: "Mental Math"}, {type: "Subtraction", ratingType: "Mental Math"}, {type: "Multiplication", ratingType: "Mental Math"}, {type: "Division", ratingType: "Mental Math"}]
  const [gameType, setGameType] = useState(props.gameType)
  if(!props.userID) {
    return (
      <Grid className={classes.root} container direction="column" >
      <h1 className={classes.title}>
      &nbsp; QuickMaths
      </h1>
   
        <GoogleLogin
          clientId={GOOGLE_CLIENT_ID}
          buttonText="Login"
          onSuccess={props.handleLogin}
          onFailure={(err) => console.log(err)}
        
        />
    
      </Grid>
    )
  }
  //Object.keys(game.gameData).length
  let userIDList = Object.keys(props.userInfo)
  let connectedUsers = userIDList.map((id) => {
      return <ListItem><ListItemText primary={props.userInfo[id].displayName + ": " + Math.round(props.userInfo[id].ELO[gameType.ratingType])} className={classes.title} /></ListItem>
  })
  let createGame = (timeLimit) => {
    setCanCreateGames(false)
    setTimeout(() => {setCanCreateGames(true)}, 5000)
    // create new game object with questions
    let questionList = [];
    get("api/questions", { numQuestions: 400, type: gameType.type }).then((questions) => {
      let innerQuestionList = [];
      questions.forEach((question) => innerQuestionList.push(question));
      questionList = innerQuestionList;
     // console.log(questionList);
      post("api/createGame", { questionList: questionList, type: gameType.type, ratingType: gameType.ratingType, timeLimit: timeLimit}).then((game) => {
        console.log("did the create");
        props.updateState({gameID: game._id})
      });
    });
  }

  
  
  return (
    <>
    <Grid className={classes.root} container direction="column" style={{paddingLeft: "10px", paddingRight: "10px", paddingBottom: "10px"}}>
      <h1 className={classes.title}>
      &nbsp; QuickMaths
      </h1>
    
        
   
      

      {/* dropdown */ }
      
        <Select
          value={JSON.stringify(gameType)}
          onChange={(newGameType) => {
            //console.log(newGameType.target.value)
            props.updateState({gameType: JSON.parse(newGameType.target.value)})
            setGameType(JSON.parse(newGameType.target.value))
          }}
          label="Game Type"
          variant="outlined"
          className={classes.title}
        >
          {gameTypes.map((thisGameType) => {
            return (
          <MenuItem value={JSON.stringify(thisGameType)}>{thisGameType.type}</MenuItem>)
  
          })}
        </Select>
     
        
       {/* createGame */}
       <Grid container direction="row" width={"280px"}>
         <Box width={1/2} >
       <Button
          className={classes.title}
          disabled={!canCreateGames}
          onClick={()=>{createGame(20)}}
          fullWidth
        >
          New Race
        </Button>
        </Box>
        <Box width={1/2} >
        <Button
          className={classes.title}
          disabled={!canCreateGames}
          onClick={()=>{createGame(120)}}
          fullWidth
        >
          New Marathon
          
        </Button>
        </Box>
        </Grid>
    
        <h3 className={classes.title}>Welcome, {props.userInfo[props.userID].displayName}! </h3>
        <Box height={"360px"} style={{overflow: "scroll" }}>
        <List>
          {connectedUsers}
        </List>

        </Box>
        <Button className={classes.title} onClick={() => {
          let myScoresRace = {}
          let myScoresMarathon = {}
          get("api/allUsers").then((users)=> {
            let counter = 0
            users.forEach((user) => {

              if(!(Object.keys(user.highScore || {}).length == 0)) {
              if(user.highScore[gameType.type+"Race"] > 0)
                  myScoresRace[user._id] = {name: user.displayName, score: user.highScore[gameType.type+"Race"]}
              if(user.highScore[gameType.type+"Marathon"] > 0)
                  myScoresMarathon[user._id] = {name: user.displayName, score:  user.highScore[gameType.type+"Marathon"]}
              }
              counter += 1
              if(counter === users.length) {
                setScoresMarathon(myScoresMarathon)
                setScoresRace(myScoresRace)
                setModal(true)
              }
            })
          })
          
          
          
          }}>Leaderboard</Button>
        {clickedLogout ? <GoogleLogout
          clientId={GOOGLE_CLIENT_ID}
          buttonText="Logout"
          onLogoutSuccess={props.handleLogout}
          onFailure={(err) => console.log(err)}
        
        /> : <Button className={classes.title} onClick={()=>setClickedLogout(true)}>Logout</Button>}
        
        

        
    </Grid>
    <Dialog fullScreen open={modal} onClose={() => {setModal(false); setScoresMarathon({}); setScoresRace({})}} TransitionComponent={Transition}>
    <AppBar className={classes.appBar}>
          <Toolbar>
            <IconButton edge="start" color="inherit" onClick={() => {setModal(false); setScoresMarathon({}); setScoresRace({})}} aria-label="close">
              <CloseIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
        <Grid container direction="row">
        <Box style={{paddingLeft: "10px", paddingRight: "10px"}} width={8/17}> 
        
        <h1>{gameType.type + " Race"}</h1>
        <ScorePage scores={scoresRace} cutOff={10} userID={props.userID} inProgress = {false} />
        </Box>
        <Box style={{paddingLeft: "10px", paddingRight: "10px"}} width={8/17}> 
        <h1>{gameType.type + " Marathon"}</h1>
        <ScorePage scores={scoresMarathon} cutOff={10} userID={props.userID} inProgress = {false} />
        </Box>
        </Grid>
    </Dialog>
  </>
  );
};
