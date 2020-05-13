import Box from '@material-ui/core/Box';
import React, { Component, useState } from 'react';
import { get, post } from "../../utilities";
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
export default function Timer(props) {
  let originalValue = Math.floor(((new Date(props.endTime)).getTime() - (new Date()).getTime())/1000);
  const [value, setValue] = useState(originalValue);
  const [color, setColor] = useState("#6c57f5")
  setInterval(() => {setValue(Math.floor(((new Date(props.endTime)).getTime() - (new Date()).getTime())/1000))}, 1000)
  if(value <= 3 && (value >= -5) && (color !== "#FF0000")) {
    setColor("#FF0000")
  }
  if(value <= 0) {
    /*
    post("api/gameFinished", {gameID: props.gameID}).then(() => {
      if(props.host.userID === props.userID) {
      post("api/changeRatings", {gameID: props.gameID, gameData: props.gameData, ratingType: props.ratingType})
      }
    })
    */
    props.finish();
  
  }
  
  return (
    <h1 style={{color: color, display: "flex", justifyContent: "center"}}>{value}</h1>
  );
};
