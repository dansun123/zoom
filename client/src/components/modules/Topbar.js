import React, { Component } from "react";
import GoogleLogin, { GoogleLogout } from "react-google-login";

import "../../utilities.css";
import "./Topbar.css";

class Topbar extends Component {
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
        <div className = "topbar">
          <div className = "title">DJ-Zoomer</div>
          {this.props.userId ? <div className = "welcome">Welcome {this.props.name}</div>: <></>}
          <div className = "login">
          </div>
        </div>
      </>
    );
  }
}
// ATLAS_SRV = "mongodb+srv://prtyr:ZSsOoWnge7gxAYUi@cluster0-eks3r.mongodb.net/test?retryWrites=true&w=majority"


export default Topbar;
