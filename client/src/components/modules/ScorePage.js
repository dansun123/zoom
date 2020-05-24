import React, { Component, useState } from "react";
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import LinearProgress from '@material-ui/core/LinearProgress'
export default function ScorePage(props) {
  const [maxValue, setMaxValue] = useState(15)
  let scoreListElements = props.roomData.sort((a, b) => {return b.score - a.score}).map((user, place) => {
  
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
    return <ListItem button dense>

    <h3 style={{fontWeight: "900", color: nameColor}}>{(user.userName || "") + ": " + (user.score || "0") + " "} </h3>
   
    
    </ListItem>
  })

  let height = "370px";
  return (
    <Box  style={{overflow: "scroll", height: height}} >
        <List>
          {scoreListElements}
        </List>
    </Box>
  );
};
