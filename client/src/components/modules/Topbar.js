import React, { Component } from "react";
import GoogleLogin, { GoogleLogout } from "react-google-login";

import "../../utilities.css";
import "./Topbar.css";

const GOOGLE_CLIENT_ID = "928327247031-413d31f766bgvvse5q6u14u3h7io5309.apps.googleusercontent.com";

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
          <div className = "djzoomer">DJ-Zoomer</div>
          <div className = "welcome">Hey {this.props.name}</div>
          <div className = "login-logout">
            {this.props.userId ? (
              "yes"
            ) : (
              "no"
            )}
          </div>
        </div>

      </>
    );
  }
}

export default Topbar;
