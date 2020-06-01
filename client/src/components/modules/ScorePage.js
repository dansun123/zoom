import React, { Component, useState } from "react";
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import Divider from '@material-ui/core/Divider';
import Zoom from '@material-ui/core/Zoom';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';

import LinearProgress from '@material-ui/core/LinearProgress'
export default function ScorePage(props) {
  const [maxValue, setMaxValue] = useState(15)
  let scoreListElements = props.roomData.sort((a, b) => {if(props.rating) {return b.rating - a.rating};if(props.leaderboard) {return b.maxScore - a.maxScore};  return b.score - a.score}).map((user, place) => {
  
    let fontWeight = 'normal'

    let nameColor = "#2196f3"

    if(user.userID === props.userID) {
      nameColor = "#f50057"
      fontWeight = 'bold'

    }
  
   
    if(user.score > maxValue) {
      setMaxValue(maxValue * 2)
    }
    if(Object.keys(props).includes("cutOff")) {
      if(place >= props.cutOff) return <></>
    }
    if(props.leaderboard) {
      if(user.maxScore < 10) return <></>
    }
    return <ListItem button dense style={{height: props.leaderboard ? "40px" : undefined}}>

    {props.leaderboard ?
    <h4 style={{fontWeight: "900", color: nameColor}}>{(place + 1) + ". \t" + (user.userName || "")} </h4>
   :
   <h3 style={{fontWeight: "900", color: nameColor}}>{ (user.userName || "")}</h3>
    }

  <ListItemSecondaryAction>
    {props.leaderboard ? <h4 style={{fontWeight: "900", color: nameColor}}>{((props.rating ? user.rating : (props.leaderboard ? user.maxScore : user.score)) || "0") + " "} </h4>
    :   <h3 style={{fontWeight: "900", color: nameColor}}>{((props.rating ? user.rating : (props.leaderboard ? user.maxScore : user.score)) || "0") + " "} </h3>
  }
    </ListItemSecondaryAction>
    </ListItem>
  })

  
  

  let height = "calc(100% - 156px)";
  if(props.finalResults) height = "calc(100% - 224px)";
  if(props.leaderboard) {
    height = "calc(50% - 78px)";
    if(props.finalResults) height = "calc(50% - 112px)";
  }
  if(props.roomAnswers) {
    let roomAnswerElements = props.roomAnswers.sort((a,b) => {return a.time - b.time}).map((roomAnswer, place) => {
      let nameColor = "#2196f3"
  
      if(roomAnswer.userID === props.userID) {
        nameColor = "#f50057"
      }
      let color = nameColor
      if(place === 0) color = "#3bb033"
      return (
        <Zoom in={true}>
      <ListItem button dense>
        
      <h3 style={{fontWeight: "900", color: color}}>{roomAnswer.time + " sec: " + roomAnswer.userName + " (+" + (roomAnswer.points)  + ")"} </h3>
     
      
      </ListItem>
      </Zoom>)
    })

    return (
    <Grid container direction="row" style={{width: "100%", height: height}}>
    <Box  style={{overflow: "scroll", height: "100%"}} width={props.withLeaderboard ? 4/11 : 3/11} >
        <List>
          {scoreListElements}
        </List>
    </Box>
    {props.roomAnswers.length > 0 ? <Divider orientation="vertical" flexItem /> : <></>}
    <Box  style={{overflow: "scroll", height: "100%"}} width={props.withLeaderboard ? 6/11 : 7/11} >
        <List>
          {roomAnswerElements}
        </List>
    </Box>
    </Grid>)
  
  }

  return (
    <Box  style={{overflow: "scroll", height: height}} >
        <List>
          {scoreListElements}
        </List>
    </Box>
  );
};
