const express = require("express");
const router = express.Router();
const Parse = require("parse/node");
const config = require("config");
const fs = require("fs");
const request = require("request");

const PARSE_APP_ID = config.get("PARSE_KEYS.PARSE_APP_ID");
const PARSE_JS_KEY = config.get("PARSE_KEYS.PARSE_JS_KEY");
const PARSE_MASTER_KEY = config.get("PARSE_KEYS.PARSE_MASTER_KEY")

Parse.initialize(PARSE_APP_ID, PARSE_JS_KEY, PARSE_MASTER_KEY);
Parse.serverURL = "http://parseapi.back4app.com/";
Parse.User.enableUnsafeCurrentUser();

const INSTA_APP_ID = config.get("INSTA_KEYS.INSTA_APP_ID");
const INSTA_APP_SECRET = config.get("INSTA_KEYS.INSTA_APP_SECRET");

router.post("/reset-session", async (req, res) => {
  const infoUser = req.body;

  try {
    const user = await Parse.User.become(infoUser.sessionToken);
    const rawdata = fs.readFileSync("data/majors.json");
    const majors = JSON.parse(rawdata);
    res.send({
      userInfo: user,
      loginMessage: "User logged in!",
      typeStatus: "success",
      infoUser: infoUser,
      majors: majors,
    });
  } catch (error) {
    console.log("error", error);
    res.send({ loginMessage: error, typeStatus: "danger", infoUser: infoUser });
  }
});

router.post("/login", async (req, res) => {
  const infoUser = req.body;
  try {
    const user = await Parse.User.logIn(infoUser.email, infoUser.password);
    const sessionToken = user.getSessionToken();
    const rawdata = fs.readFileSync("data/majors.json");
    const majors = JSON.parse(rawdata);
    res.send({
      userInfo: user,
      sessionToken: sessionToken,
      loginMessage: "User logged in!",
      typeStatus: "success",
      infoUser: infoUser,
      majors: majors,
    });
  } catch (error) {
    console.log("error", error);
    res.send({ loginMessage: error, typeStatus: "danger", infoUser: infoUser });
  }
});

router.post("/logout", async (req, res) => {
  try {
    const query = new Parse.Query("_Session");
    query.equalTo("sessionToken", req.body.sessionToken);
    await query.first({ useMasterKey: true }).then(function (user) {
      if (user) {
        user
          .destroy({ useMasterKey: true })
          .then(function () {
            res.send({
              logoutMessage: "User logged out!",
              typeStatus: "success",
            });
          })
          .catch(function (error) {
            console.log(error);
            return null;
          });
      } else {
        res.send({
          logoutMessage: "error",
          RegisterMessage: "",
          typeStatus: "danger",
          infoUser: user,
        });
      }
    });
  } catch (error) {
    res.send({ logoutMessage: error.message, typeStatus: "danger" });
  }
});

router.post("/signup", async (req, res) => {
  const infoUser = req.body;
  let user = new Parse.User();

  user.set("username", infoUser.email);
  user.set("email", infoUser.email);
  user.set("password", infoUser.password);
  user.set("preferredName", infoUser.preferredName);
  user.set("phoneNum", infoUser.phoneNum);

  const rawdata = fs.readFileSync("data/us_institutions.json");
  const colleges = JSON.parse(rawdata);

  try {
    await user.signUp();
    //await Parse.User.logIn(infoUser.email, infoUser.password);
    const sessionToken = user.getSessionToken();
    res.send({
      signupMessage: "User signed up!",
      typeStatus: "success",
      infoUser: infoUser,
      colleges: colleges,
      sessionToken: sessionToken,
    });
  } catch (error) {
    res.send({
      signupMessage: error.message,
      typeStatus: "danger",
      infoUser: infoUser,
    });
  }
});

router.post("/verify", async (req, res) => {
  const infoUser = req.body;

  try {
    const currentUser = await Parse.User.become(infoUser.sessionToken);
    if (currentUser) {
      console.log("current user")
      currentUser.set("firstName", infoUser.firstName);
      currentUser.set("lastName", infoUser.lastName);
      currentUser.set("university", infoUser.university);
      currentUser.set("DOB", infoUser.dob);
      await currentUser.save();
      const rawdata = fs.readFileSync("data/majors.json");
      const majors = JSON.parse(rawdata);

      res.send({
        userInfo: currentUser,
        majors : majors,
        verifyMessage: "User verified!",
        typeStatus: "success",
        infoUser: infoUser,
      });
    } else {
      res.send({
        verifyMessage: "Can't get current user",
        typeStatus: "danger",
        infoUser: infoUser,
      });
    }
  } catch (error) {
    res.send({
      verifyMessage: error.message,
      typeStatus: "danger",
      infoUser: infoUser,
    });
  }
});

const requestSpotifyToken = (res, redirect_uri, code, params) => {
  // send form based request to Spotify API
  request.post(
    {
      url: "https://accounts.spotify.com/api/token",
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: "authorization_code",
        client_id: config.get("SPOTIFY_KEYS.SPOTIFY_CLIENT_ID"),
        client_secret: config.get("SPOTIFY_KEYS.SPOTIFY_CLIENT_SECRET"),
      },
      json: true,
    },
    function (err, httpResponse, body) {
      console.log("err", err);
      res.send({ params: params, result: body, typeStatus: "success" });
    }
  );
};

const requestSpotifyRefreshToken = (res, refresh_token, params) => {
  // send form based request to Spotify API
  request.post(
    {
      url: "https://accounts.spotify.com/api/token",
      form: {
        grant_type: "refresh_token",
        refresh_token: refresh_token,
        client_id: config.get("SPOTIFY_KEYS.SPOTIFY_CLIENT_ID"),
        client_secret: config.get("SPOTIFY_KEYS.SPOTIFY_CLIENT_SECRET"),
      },
      json: true,
    },
    function (err, httpResponse, body) {
      console.log("err", err);
      res.send({ params: params, result: body, typeStatus: "success" });
    }
  );
};

router.post("/refresh-spotify", (req, res) => {
  // data from frontend
  var refresh_token = req.body.refresh_token;

  try {
    requestSpotifyRefreshToken(res, refresh_token, req.body);
  } catch (e) {
    res.send({
      request: req.body,
      spotifyMessage: "refresh token failed",
      typeStatus: "danger",
      error: e,
    });
  }
});

router.post("/init-spotify", (req, res) => {
  // data from frontend
  let code = req.body.code;
  let redirect_uri = req.body.redirectUri;

  try {
    requestSpotifyToken(res, redirect_uri, code, req.body);
  } catch (e) {
    res.send({
      request: req.body,
      spotifyMessage: "short term access token failed",
      typeStatus: "danger",
      error: e,
    });
  }
});

const requestToken = (res, redirect_uri, code, userInfo, params) => {
  // send form based request to Instagram API
  request.post(
    {
      url: "https://api.instagram.com/oauth/access_token",
      form: {
        client_id: INSTA_APP_ID,
        client_secret: INSTA_APP_SECRET,
        grant_type: "authorization_code",
        redirect_uri,
        code,
      },
    },
    function (err, httpResponse, body) {
      let result = JSON.parse(body);
      if (result.access_token) {
        // Got access token. Parse string response to JSON
        let accessToken = result.access_token;
        res.send({
          params: params,
          userInfo: userInfo,
          result: result,
          accessToken: accessToken,
          typeStatus: "success",
        });
      }
    }
  );
};

router.post("/init-insta", async (req, res) => {
  // data from frontend
  let code = req.body.code;
  let redirect_uri = req.body.redirectUri;
  let objectId = req.body.objectId;

  const query = new Parse.Query(Parse.User);
  query.equalTo("objectId", objectId);
  const userInfo = await query.first();
  try {
    requestToken(res, redirect_uri, code, userInfo, req.body);
  } catch (e) {
    res.send({
      request: req.body,
      instaMessage: "short term access token failed",
      typeStatus: "danger",
      error: e,
      userInfo: userInfo,
    });
  }
});

router.get("/userTable", async (req, res) => {
  try {
    //get all users
    const query = new Parse.Query(Parse.User);
    const entries = await query.find();
    res.send({
      userTableMessage: "user table created",
      entries: entries,
      typeStatus: "success",
    });
  } catch (err) {
    res.send({
      userTableMessage: "Error getting user table",
      typeStatus: "danger",
    });
  }
});

module.exports = router;
