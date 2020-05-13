import React, { Component } from "react";
import sound from "../images/RadioWaves.png";


import "../../utilities.css";
import "./Main.css";

class Main extends Component {
  constructor(props) {
    super(props);
    // Initialize Default State
    this.state = {};
  }

  componentDidMount() {
    // remember -- api calls go here!
  }

  render() {
    return (
      <>
        <div>Main</div>
        <img src = {sound}></img>

      </>
    );
  }
}

export default Main;
