import React, { Component, useState } from "react";
import instruments from "../../public/instruments.js"
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import LinearProgress from '@material-ui/core/LinearProgress'
import { Piano, KeyboardShortcuts, MidiNumbers } from 'react-piano';
import 'react-piano/dist/styles.css';

import DimensionsProvider from './DimensionsProvider';
import SoundfontProvider from './SoundfontProvider';
import { post } from "../../utilities";

export default function ReactPiano(props) {
    const noteRange = {
        first: MidiNumbers.fromNote('c3'),
        last: MidiNumbers.fromNote('f4'),
      };
      const keyboardShortcuts = KeyboardShortcuts.create({
        firstNote: noteRange.first,
        lastNote: noteRange.last,
        keyboardConfig: KeyboardShortcuts.HOME_ROW,
      });

    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const soundfontHostname = 'https://d1pzp51pvbm36p.cloudfront.net';


  
  return (
    instruments.map((instrument => { 
        return <SoundfontProvider
        instrumentName={instrument}
        audioContext={audioContext}
        hostname={soundfontHostname}
        gameID={props.gameID}
        render={({ isLoading, playNote, stopNote, stopAllNotes }) => {
            
            return (
            
           (instrument===props.instrument)?
          <Piano
            noteRange={noteRange}
            width={600}
            playNote={(midiNumber) => {
                post("/api/playNote", {midiNumber: midiNumber, instrument: instrument, gameID: props.gameID})
              }
              }
            stopNote={(midiNumber) => {
              post("/api/stopNote", {midiNumber: midiNumber, instrument: instrument, gameID: props.gameID})
            }}
            disabled={isLoading}
            keyboardShortcuts={keyboardShortcuts}
          />:<></>
        )}}
      />
    }))
    
  );
};
