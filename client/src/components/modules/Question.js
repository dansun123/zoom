import React, { Component } from "react";
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
export default function Question(props) {
  return (
    <Box style={{justifyContent: "center"}}>
      
        <h1 style={{display: "flex", justifyContent: "center"}}>
            {props.question.statement}
        </h1>
        
    </Box>
  );
};
