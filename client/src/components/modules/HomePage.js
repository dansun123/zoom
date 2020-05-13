import React, { Component } from "react";
import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import List from "@material-ui/core/List";
import Divider from "@material-ui/core/Divider";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import SideBar from "./SideBar.js";
import Chat from "./Chat.js";
import { socket } from "../../client-socket.js";
import { get, post } from "../../utilities";
class HomePage extends Component {
  // makes props available in this component
  constructor(props) {
    super(props);
    this.state = {
      gameList: [],
      userInfo: {},
      chat: [],
      messageText: "",
      gameID: props.gameID,
      offerToSetUsername: false,
      inputUsername: "",
    };
  }

  getUserInfo = () => {
    if (this.props.userID) {
      //console.log(this.props.userID)
      get("api/getUser").then((user) => {
        //console.log(user)
        //console.log(user.setUsername + "hees")
        let setUsername =
          user.setUsername === undefined ? false : user.setUsername;
        //console.log("HAAAA" + setUsername)
        this.setState({ offerToSetUsername: !setUsername });
      });
    }

    get("api/getUsers").then((users) => {
      //console.log(users)
      //console.log("Hello got here")
      let userInfo = {};
      let counter = 0;
      users.forEach((user) => {
        //console.log(user.setUsername)

        userInfo[user._id] = {
          name: user.name,
          username: user.username,
          displayName: user.displayName,
          ELO: Object.assign({}, user.ELO),
          gameID: user.gameID,
          picture: user.picture,
          highScore: Object.assign({}, user.highScore),
          setUsername: user.setUsername,
        };

        //console.log(user.ELO)
        counter += 1;
        if (counter === users.length) {
          this.setState({
            userInfo: userInfo,
            unimportantThingy: Math.random(10000),
          });
        }
      });
    });
  };
  setData = () => {
    this.getUserInfo();
    get("api/listOfCurrentGames").then((games) => {
      this.setState({ gameList: games.waiting.concat(games.inProgress) });
    });
  };
  componentDidMount() {
    this.setData();
    socket.on("createGame", (game) => {
      //console.log(game)
      let newGameList = this.state.gameList;
      newGameList.push(game);
      this.setState({
        gameList: newGameList,
      });
    });
    socket.on("getUserInfo", (res) => {
      this.getUserInfo();
    });
    socket.on("newPlayer", (data) => {
      let gameList = this.state.gameList;
      //console.log(gameList)
      if (data.userID === this.props.userID) return;
      let index = 0;
      while (gameList[index]._id !== data.gameID) {
        //console.log(index)
        index += 1;
      }

      let newGameData = gameList[index].gameData || {};
      newGameData[data.userID] = { score: 0, questionNumber: 0 };
      gameList[index].gameData = newGameData;
      this.setState({
        gameList: gameList,
      });
    });

    socket.on("startTimer", (data) => {
      let gameList = this.state.gameList;
      if (data.userID === this.props.userID) return;
      let index = 0;
      while (gameList[index]._id !== data.gameID) {
        // console.log(index+".")
        index += 1;
      }
      if (index >= gameList.length) return;
      gameList[index].status = "inProgress";
      this.setState({
        gameList: gameList,
      });
    });

    socket.on("started", (data) => {
      let gameList = this.state.gameList;
      if (data.userID === this.props.userID) return;
      let index = 0;
      while (gameList[index]._id !== data.gameID) {
        //console.log(index+".")
        index += 1;
      }
      if (index >= gameList.length) return;
      gameList[index].status = "inProgress";
      this.setState({
        gameList: gameList,
      });
    });
    socket.on("playerLeft", (data) => {
      let gameList = this.state.gameList;
      if (data.userID === this.props.userID) return;
      if (data.status === "finished") return;
      
      let index = 0;

      while (index < gameList.length && gameList[index]._id !== data.gameID) {
        // console.log(gameList[index]._id + " " + data.gameID)
        // console.log(index+"?")
        index += 1;
      }
      let newGameData = gameList[index].gameData || {};
      delete newGameData[data.userID];
      newGameData = newGameData || {};
      //console.log(newGameData)
      gameList[index].gameData = newGameData;
      this.setState({
        gameList: gameList,
      });
    });
    socket.on("setData", (userID) => {
      if (userID === this.props.userID) this.setData();
    });
    socket.on("gameDestroyed", (data) => {
      if (data.userID === this.props.userID) return;
      let gameList = this.state.gameList;
      if (data.status === "finished") return;
      let index = 0;
      while (index < gameList.length && gameList[index]._id !== data.gameID) {
        //console.log(gameList[index]._id + " " + data.gameID)
        //console.log(index+"?")
        index += 1;
      }
      if (index >= gameList.length) {
        //post("api/leaveGame")
        return;
      }
      gameList.splice(index, 1);
      this.setState({
        gameList: gameList,
      });
      //if(data.userID === this.props.userID) return;
      //post("api/leaveGame")
    });

    socket.on("gameFinished", (game) => {
      //if(game.userID === this.props.userID) return;
      this.setState({
        gameList: this.state.gameList.filter((game1) => {
          return game1._id !== game.gameID;
        }),
      });
    });

    socket.on("newLogin", (user) => {
      let newUserInfo = this.state.userInfo;
      newUserInfo[user._id] = {
        name: user.name,
        username: user.username,
        displayName: user.displayName,
        ELO: Object.assign({}, user.ELO),
        gameID: user.gameID,
        picture: user.picture,
        highScore: Object.assign({}, user.highScore),
        setUsername: user.setUsername || false,
      };
      this.setState({
        userInfo: newUserInfo,
      });
    });
  }

  render() {
    let handleClose = () => {
      if (!validUsername(this.state.inputUsername)) return;
      post("api/newUsername", {
        userID: this.props.userID,
        username: this.state.inputUsername,
      }).then(() => {
        this.setState({ offerToSetUsername: false });
        this.setData();
      });
    };
    let validUsername = (username) => {
      if (username === "Guest") return false;

      return (
        username.length >= 3 && username.length <= 15 && !username.includes(" ")
      );
    };
    if (
      Object.keys(this.state.userInfo).length === 0 ||
      this.props.gameID !== "Lobby"
    )
      return <div />;

    const redirect = (url) => {
      this.props.updateState({ redirect: url });
    };
    let joinButtons = "";
    let mainPage = "";
    if (this.props.userID) {
      joinButtons = this.state.gameList.map((game) => {
        //console.log(game)
        return (
          <ListItem>
            <ListItemText
              primary={
                game.host.name +
                "'s " +
                game.type +
                " " +
                (game.timeLimit < 60 ? "Race" : "Marathon") +
                " (" +
                Object.keys(game.gameData || {}).length +
                " Players)"
              }
              secondary = {Object.keys(game.gameData).map((userID)=>{return game.gameData[userID].name}).filter((userID, index) => {return (index < 10)} ).concat(Object.keys(game.gameData).length > 10 ? ["..."] : []).join(", ")}
            />
            {game.status === "waiting" ? (
              <Button
                color="primary"
                onClick={() => {
                  post("api/joinGame", { gameID: game._id }).then((worked) => {
                    if (worked) this.props.updateState({ gameID: game._id });
                    else this.setState({ status: "inProgress" });
                  });
                }}
              >
                Join
              </Button>
            ) : (
              <Button disabled={true}>In Progress</Button>
            )}
          </ListItem>
        );
      });

      mainPage = (
        <Grid container direction="column">
          <List>{joinButtons}</List>
        </Grid>
      );
    }
    return (
      <div>
        <Grid container direction="row" width={1} height={1}>
          <Box width={"300px"} height={1}>
            <SideBar
              handleLogin={this.props.handleLogin}
              handleLogout={this.props.handleLogout}
              userID={this.props.userID}
              updateState={this.props.updateState}
              //state={this.state}
              userInfo={this.state.userInfo}
              gameType={this.props.gameType}
            />
          </Box>

          {this.props.userID ? (
            <Box width={"calc(100% - 300px)"} height={1}>
              <Grid container direction="column">
                <Box height={"335.31px"} style={{ overflow: "scroll" }}>
                  {mainPage}
                </Box>

                <Chat messages={this.props.chat} gameID={this.state.gameID} />
              </Grid>
            </Box>
          ) : (
            ""
          )}
        </Grid>
        <Dialog
          open={this.state.offerToSetUsername}
          onClose={handleClose}
          aria-labelledby="form-dialog-title"
        >
          <DialogTitle id="form-dialog-title">Choose a Username</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Welcome to QuickMaths! Please choose a Username. You will not be
              able to change the username.
            </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              id="name"
              label="Username"
              type="text"
              value={this.state.inputUsername}
              onChange={(event) => {
                this.setState({ inputUsername: event.target.value });
              }}
              fullWidth
            />
          </DialogContent>
          <DialogActions>
            <Button
              onClick={handleClose}
              color="primary"
              disabled={!validUsername(this.state.inputUsername)}
            >
              Submit
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}
export default HomePage;
