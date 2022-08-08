import * as React from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import { useState } from "react";
import "./App.css";
import axios from "axios";
import Login from "../Login/Login";
import SignUp from "../SignUp/SignUp";
import VerifyStudent from "../SignUp/VerifyStudent/VerifyStudent";
import Navbar from "../Navbar/Navbar";
import BasicInfo from "../User/BasicInfo/BasicInfo";
import BasicInfoEdit from "../User/BasicInfo/BasicInfoEdit/BasicInfoEdit";
import Interests from "../User/Interests/Interests";
import Media from "../User/Media/Media";
import InterestsEdit from "../User/Interests/InterestsEdit/InterestsEdit";
import MediaEdit from "../User/Media/MediaEdit/MediaEdit";
import Matching from "../Matching/Matching";
import NotFound from "../NotFound/NotFound";
import Loading from "../Loading/Loading";
import InstaRedirect from "../InstaRedirect/InstaRedirect";
import SpotifyRedirect from "../SpotifyRedirect/SpotifyRedirect";
import UserTable from "../UserTable/UserTable";
import Suggestions from "../Suggestions/Suggestions";
import Liked from "../Liked/Liked";

export default function App() {
  const PORT = "3001";

  const TMDB_API_KEY = "658568773162c3aaffcb3981d4f5587b";
  const MOVIE_SEARCH_URL = `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=`;
  const TV_SEARCH_URL = `https://api.themoviedb.org/3/search/tv?api_key=${TMDB_API_KEY}&query=`;

  const INSTA_APP_ID = "390997746348889";
  const INSTA_RED_URI = "https://localhost:3000/insta-redirect";
  const INSTA_APP_SECRET = "facb6a96ac24a92b82f0a6b254c0ec69";

  const SPOTIFY_SCOPE =
    "user-top-read user-read-private user-read-email user-read-recently-played";
  const SPOTIFY_CLIENT_ID = "070101f8397d43e6b9c27755bd380617";
  const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
  const SPOTIFY_RED_URI = "https://localhost:3000/spotify-redirect";
  const SPOTIFY_STATE = Math.random().toString().substr(2, 8);
  const SPOTIFY_RESPONSE_TYPE = "code";
  const AUTH_URL = `${AUTH_ENDPOINT}?client_id=${SPOTIFY_CLIENT_ID}&redirect_uri=${SPOTIFY_RED_URI}&response_type=${SPOTIFY_RESPONSE_TYPE}&scope=${SPOTIFY_SCOPE}&state=${SPOTIFY_STATE}`;

  const MATCH_LIMIT = 2;

  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState("");
  const [isFetching, setIsFetching] = useState(false);

  const [movie, setMovie] = useState("");
  const [TV, setTV] = useState("");
  const [hobbiesList, setHobbiesList] = useState("");
  const [selectedHobbyOption, setSelectedHobbyOption] = useState(null);
  const [newHobby, setNewHobby] = useState(null);

  const [userMatches, setUserMatches] = useState([]);
  const [matchOffset, setOffset] = useState(0);
  const [fetchingMatches, setFetchingMatches] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [suggestMatch, setSuggestMatch] = useState(false);
  const [seeMoreMatches, setSeeMoreMatches] = useState(true);

  const [token, setToken] = useState("");
  const [spotifyRefreshed, setSpotifyRefreshed] = useState(false);
  const [instaRefreshed, setInstaRefreshed] = useState(false);

  const [collegeList, setCollegeList] = useState(null);
  const [selectedCollegeOption, setSelectedCollegeOption] = useState(null);
  const [majorList, setMajorList] = useState(null);
  const [selectedMajorOption, setSelectedMajorOption] = useState(null);

  React.useEffect(() => {
    if (window.location.href.includes("code") && token == "") {
      const queryString = window.location.href;
      const code = queryString.split("code=").pop().split("&state")[0];
      getRefreshToken(code);
      window.localStorage.setItem("code", code);
      setToken(code);
    }
  }, []);

  //update matches when user info changes
  React.useEffect(() => {
    if (window.localStorage.getItem("sessionToken") && userInfo.interests) {
      if (userMatches.length == 0 && !fetchingMatches) {
        createMatches({});
      }
      if (matchOffset > 0) {
        getMatchesForUser(MATCH_LIMIT * matchOffset, 0);
      } else {
        getMatchesForUser(MATCH_LIMIT, 0);
        setOffset(0);
        setSeeMoreMatches(true);
      }
    }
    if (
      userInfo != "" &&
      window.localStorage.getItem("sessionToken") &&
      !userInfo.interests
    ) {
      getInterestsFromUser();
    }
  }, [userInfo]);

  React.useEffect(() => {
    if (window.performance) {
      if (
        window.localStorage.getItem("sessionToken") &&
        !userInfo &&
        String(window.performance.getEntriesByType("navigation")[0].type) ===
          "reload"
      ) {
        refreshLogin();
      }
    }
  }, []);

  React.useEffect(() => {
    if (
      window.location.href.includes("code") &&
      !isFetching &&
      !userInfo.ig_accessToken
    ) {
      postInsta();
    }
  }, []);

  const refreshLogin = () => {
    if (!isRefreshing) {
      setIsRefreshing(true);
      const sessionToken = window.localStorage.getItem("sessionToken");
      if (sessionToken) {
        axios
          .post(`https://localhost:${PORT}/reset-session`, {
            sessionToken: sessionToken,
          })
          .then(function (response) {
            setUserInfo(response.data.userInfo);
            setMajorList(response.data.majors);
            setToken("");
            setOffset(0);
            setInstaRefreshed(false);
            setSpotifyRefreshed(false);
            setIsRefreshing(false);
          })
          .catch(function (err) {
            console.log("err", err);
          });
      }
    }
  };

  const refreshSpotifyAccessToken = async () => {
    setSpotifyRefreshed(true);
    if (userInfo.spotify_refresh_token) {
      await axios
        .post(`https://localhost:${PORT}/refresh-spotify`, {
          refresh_token: userInfo.spotify_refresh_token,
        })
        .then(({ data }) => {
          getSpotifyArtists(
            data.result.access_token,
            userInfo.spotify_refresh_token
          );
        })
        .catch(({ error }) => {
          console.log("error", error);
        });
    }
    setIsFetching(false);
  };

  const getRefreshToken = async (code) => {
    if (!userInfo.spotify_refresh_token && !spotifyRefreshed) {
      setIsFetching(true);
      await axios
        .post(`https://localhost:${PORT}/init-spotify`, {
          code: code,
          redirectUri: SPOTIFY_RED_URI, // needs to be registered at fb developer console
        })
        .then(({ data }) => {
          if (data.result.access_token) {
            getSpotifyArtists(
              data.result.access_token,
              data.result.refresh_token
            );
          }
        })
        .catch(({ error }) => {
          console.log("error", error);
        });
      setIsFetching(false);
    }
  };

  const getSpotifyArtists = async (access_token, refresh_token) => {
    await axios
      .get("https://api.spotify.com/v1/me/top/artists?&limit=5", {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      })
      .then(function (response) {
        let artists = response.data.items;
        axios
          .post(`https://localhost:${PORT}/user/update`, {
            sessionToken: window.localStorage.getItem("sessionToken"),
            spotify_artists: artists,
            spotify_refresh_token: refresh_token,
          })
          .then(function (response) {
            if (spotifyRefreshed) {
              setUserInfo({
                ...userInfo,
                spotify_artists: artists,
                spotify_refresh_token: refresh_token,
              });
            }
            setIsFetching(false);
          });
      })
      .catch(function (err) {
        console.log(err);
        setIsFetching(false);
      });
  };

  const getSpotifyAuth = async () => {
    window.open(AUTH_URL, "_blank").focus();
  };

  const getInstaUsername = async (accessToken) => {
    try {
      let resp = await axios.get(
        `https://graph.instagram.com/me?fields=id,username&access_token=${accessToken}`
      );
      return resp.data.username;
    } catch (e) {
      console.log(e.response.data.error);
    }
  };

  const fetchInstaPhotos = async () => {
    try {
      if (
        window.localStorage.getItem("sessionToken") &&
        userInfo?.ig_access_token &&
        !instaRefreshed
      ) {
        setInstaRefreshed(true);
        const data = await getInstaPhotos(userInfo.ig_access_token);
        if (Array.isArray(data)) {
          uploadInstaPhotos(data);
        }
      }
    } catch (err) {
      console.log("err", err);
    }
  };

  const setupInsta = async () => {
    let appId = INSTA_APP_ID;
    let url = `https://api.instagram.com/oauth/authorize?client_id=${appId}&redirect_uri=${INSTA_RED_URI}&scope=user_profile,user_media&response_type=code`;
    window.open(url, "_blank").focus();
  };

  const postInsta = async () => {
    setIsFetching(true);

    const queryString = window.location.href;
    const code = queryString.split("?code=")[1].slice(0, -2);
    await axios
      .post(`https://localhost:${PORT}/init-insta`, {
        code: code,
        redirectUri: INSTA_RED_URI, // needs to be registered at fb developer console
      })
      .then(({ data }) => {
        if (data.accessToken) {
          getAccessToken(data.accessToken);
        }
      })
      .catch(({ error }) => {
        console.log("error", error);
      });
    setIsFetching(false);
  };

  //get long term access token from short term access token
  const getAccessToken = (accessToken) => {
    if (!isFetching) {
      setIsFetching(true);
      try {
        axios
          .get(
            `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${INSTA_APP_SECRET}&access_token=${accessToken}`
          )
          .then(async function (response) {
            accessToken = response.data.access_token;
            let username = await getInstaUsername(accessToken);
            axios
              .post(`https://localhost:${PORT}/user/update`, {
                sessionToken: window.localStorage.getItem("sessionToken"),
                accessToken: accessToken,
                username: username,
              })
              .then(function (response) {
                setUserInfo({
                  ...userInfo,
                  ig_access_token: accessToken,
                  ig_username: username,
                });
                setIsFetching(false);
              });
          });
      } catch (e) {
        console.log("Error getting long term access token", e);
      }
    }
  };

  //get long term access token from short term access token
  const uploadInstaPhotos = (photos) => {
    axios
      .post(`https://localhost:${PORT}/user/update`, {
        sessionToken: window.localStorage.getItem("sessionToken"),
        photos: photos,
      })
      .then(function (response) {
        setIsFetching(false);
        setUserInfo({ ...userInfo, ig_media: photos });
      });
  };

  const getInstaPhotos = async (accessToken) => {
    try {
      let resp = await axios.get(
        `https://graph.instagram.com/me/media?size=l&fields=media_type,permalink,media_url&access_token=${accessToken}`
      );
      resp = resp.data;
      let instaPhotos = resp.data.map((d) => d.media_url);
      return instaPhotos;
    } catch (e) {
      console.log(e.response.data.error);
      return e.response.data.error;
    }
  };

  //fetch results for movies on page using TMDB API
  const getResults = async (pageUrl) => {
    const response = await fetch(pageUrl);
    const result = await response.json();
    return result.results;
  };

  //gets search result from api for interests movie search bar
  const getMovieSearch = () => {
    const query = document.getElementById("enter-movie").value;
    if (query === "") {
      setMovie("");
    }
    getResults(MOVIE_SEARCH_URL + query).then(function (response) {
      setMovie(response[0]);
      setIsFetching(false);
    });
  };

  //gets tv result from api for interests movie search bar
  const getTVSearch = () => {
    const query = document.getElementById("enter-tv").value;
    if (query === "") {
      setTV("");
    }
    getResults(TV_SEARCH_URL + query).then(function (response) {
      setTV(response[0]);
      setIsFetching(false);
    });
  };

  const addNewHobby = (category, hobbyIndex) => {
    if (document.getElementById("enter-hobby")) {
      setNewHobby({
        name: document.getElementById("enter-hobby").value,
        category: category,
        hobbyIndex: hobbyIndex,
      });
    }
  };

  //creates matches for current user
  const createMatches = async (params) => {
    setFetchingMatches(true);
    if (userInfo && userInfo != "") {
      await axios
        .post(`https://localhost:${PORT}/matches`, {
          sessionToken: window.localStorage.getItem("sessionToken"),
          params: params,
        })
        .then(function (response) {
          console.log("matches created", response);
        })
        .catch(function (err) {
          console.log(err);
        });
    }
    setFetchingMatches(false);
  };

  //navigate to pages
  const goToSignUp = () => {
    navigate("/signup");
  };

  const goToLogin = () => {
    navigate("/login");
  };

  const goToBasic = () => {
    navigate("/user/basic");
  };

  const goToEditInfo = () => {
    navigate("/user/basic/edit");
  };

  const goToEditMedia = () => {
    navigate("/user/media/edit");
  };

  const goToEditInterests = () => {
    setMovie("");
    navigate("/user/interests/edit");
  };

  const goToInterests = () => {
    if (!userInfo?.interests) {
      getInterestsFromUser();
    }
    navigate("/user/interests");
  };

  const goToMedia = () => {
    fetchInstaPhotos();
    navigate("/user/media");
  };

  const goToSuggest = () => {
    navigate("/suggest");
  };

  const goToMatching = () => {
    setOffset(0);
    if (!fetchingMatches) {
      createMatches({});
    }
    if (matchOffset != 0) {
      getMatchesForUser(MATCH_LIMIT * matchOffset, 0);
    } else {
      getMatchesForUser(MATCH_LIMIT, 0);
      setSeeMoreMatches(true);
    }
    navigate("/user/matching");
  };

  const goToLiked = () => {
    getMatchesForUser(100, 0);
    navigate("/user/liked");
  };

  //retrieves movies, tv shows, and hobbies for user
  //sets user info
  const getInterestsFromUser = async () => {
    await axios
      .get(`https://localhost:${PORT}/user/interests`, {
        params: {
          sessionToken: window.localStorage.getItem("sessionToken"),
        },
      })
      .then((resp) => {
        if (userInfo) {
          setHobbiesList(resp.data.hobbiesList);
          setUserInfo({
            ...userInfo,
            interests: {
              movies: resp.data.movies,
              shows: resp.data.shows,
              hobbies: resp.data.hobbies,
            },
          });
          if (!spotifyRefreshed) {
            refreshSpotifyAccessToken();
          }
        }
      });
  };

  //retrieves matches for user
  //sets user info
  const getMatchesForUser = async (limit, offset) => {
    await axios
      .get(`https://localhost:${PORT}/matches`, {
        params: {
          limit: limit,
          offset: offset,
          sessionToken: window.localStorage.getItem("sessionToken"),
        },
      })
      .then((resp) => {
        if (resp.data.typeStatus == "success") {
          if (offset == 0) {
            setUserMatches(resp.data.matchesInfo);
          } else if (resp.data.matchesInfo.length == 0) {
            setSeeMoreMatches(false);
          } else if (
            userMatches.length >= MATCH_LIMIT &&
            resp.data.matchesInfo[0] &&
            !userMatches.includes(resp.data.matchesInfo[0]) &&
            !userMatches.includes(resp.data.matchesInfo[1])
          ) {
            let newMatches = userMatches.concat(resp.data.matchesInfo);
            setUserMatches(newMatches);
            if (resp.data.matchesInfo < MATCH_LIMIT) {
              setSeeMoreMatches(false);
            }
          }
        }
      });
  };

  //log user out
  const logOut = () => {
    axios
      .post(`https://localhost:${PORT}/logout`, {
        sessionToken: window.localStorage.getItem("sessionToken"),
      })
      .then(function (response) {
        setUserInfo("");
        setUserMatches([]);
        window.localStorage.clear();
        navigate("/login");
        setIsFetching(false);
      })
      .catch(function (err) {
        console.log(err);
        window.localStorage.clear();
        setIsFetching(false);
      });
  };

  //remove movie from user movies
  //reloads interests
  const removeMovie = (movie, index) => {
    axios
      .post(`https://localhost:${PORT}/user/interests/remove`, {
        sessionToken: window.localStorage.getItem("sessionToken"),
        movie: movie,
      })
      .then(function (response) {
        let movieList = userInfo.interests.movies;
        movieList.splice(index, 1);
        setUserInfo({
          ...userInfo,
          interests: {
            movies: movieList,
            shows: userInfo.interests.shows,
            hobbies: userInfo.interests.hobbies,
          },
        });
      })
      .catch(function (err) {
        console.log(err);
      });
  };

  //remove show from user shows
  //reloads interests
  const removeShow = async (show, index) => {
    axios
      .post(`https://localhost:${PORT}/user/interests/remove`, {
        sessionToken: window.localStorage.getItem("sessionToken"),
        show: show,
      })
      .then(function (response) {
        let showList = userInfo.interests.shows;
        showList.splice(index, 1);
        setUserInfo({
          ...userInfo,
          interests: {
            movies: userInfo.interests.movies,
            shows: showList,
            hobbies: userInfo.interests.hobbies,
          },
        });
      })
      .catch(function (err) {
        console.log(err);
      });
  };

  //remove hobby from user hobbies
  //reloads interests
  const removeHobby = (hobby, index) => {
    axios
      .post(`https://localhost:${PORT}/user/interests/remove`, {
        sessionToken: window.localStorage.getItem("sessionToken"),
        hobby: hobby,
      })
      .then(function (response) {
        let hobbyList = userInfo.interests.hobbies;
        hobbyList.splice(index, 1);
        setUserInfo({
          ...userInfo,
          interests: {
            movies: userInfo.interests.movies,
            shows: userInfo.interests.shows,
            hobbies: hobbyList,
          },
        });
      })
      .catch(function (err) {
        console.log(err);
      });
  };

  //sends user interests to backend
  //reloads interests
  const saveInterests = () => {
    setIsFetching(true);
    axios
      .post(`https://localhost:${PORT}/user/interests`, {
        sessionToken: window.localStorage.getItem("sessionToken"),
        interests: {
          movie: movie,
          TV: TV,
          hobby: selectedHobbyOption
            ? selectedHobbyOption.value
            : newHobby
            ? newHobby
            : null,
        },
      })
      .then(function (response) {
        getInterestsFromUser();
        navigate("/user/interests");
        setMovie("");
        setTV("");
        setIsFetching(false);
      })
      .catch(function (err) {
        console.log(err);
      });
  };

  //sends basic info to backend
  const saveBasicInfo = async () => {
    setIsFetching(true);
    let tags = [];
    if (userInfo.tags) {
      tags = userInfo.tags;
    }
    if (
      tags.indexOf(document.getElementById("tags").value) === -1 &&
      document.getElementById("tags").value !== "None"
    ) {
      tags.push(document.getElementById("tags").value);
    }

    await axios
      .post(`https://localhost:${PORT}/user/basic`, {
        sessionToken: window.localStorage.getItem("sessionToken"),
        year: document.getElementById("year").value,
        major: selectedMajorOption ? selectedMajorOption.value : null,
        hometown: document.getElementById("hometown").value,
        tags: tags,
      })
      .then(function (response) {
        setUserInfo(response.data.userInfo);
        navigate("/user/basic");
        setIsFetching(false);
      })
      .catch(function (err) {
        console.log(err);
      });
  };

  const createLoginParser = async () => {
    window.localStorage.clear();
    setIsFetching(true);
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    await axios
      .post(`https://localhost:${PORT}/login`, {
        email: email,
        password: password,
      })
      .then(function (response) {
        if (response.data.typeStatus == "danger") {
          alert("Login error");
          navigate("/login");
        } else {
          window.localStorage.setItem(
            "sessionToken",
            response.data.sessionToken
          );
          setUserInfo(response.data.userInfo);
          setMajorList(response.data.majors);
          setUserMatches([]);
          setToken("");
          setOffset(0);
          setInstaRefreshed(false);
          setSpotifyRefreshed(false);
          setSeeMoreMatches(true);
          navigate("/user/basic");
        }
        setIsFetching(false);
      })
      .catch(function (err) {
        console.log("err", err);
        window.localStorage.clear();
        navigate("/login");
        setIsFetching(false);
      });
  };

  const createSignUpParser = () => {
    if (
      !document.getElementById("password").value ||
      !document.getElementById("email").value ||
      !document.getElementById("preferredName").value ||
      !document.getElementById("phoneNum").value
    ) {
      alert("All fields are required");
    } else if (!document.getElementById("email").value.endsWith(".edu")) {
      alert("Please enter a valid .edu email");
    } else if (
      document.getElementById("password").value !==
      document.getElementById("confirm-password").value
    ) {
      alert("Passwords do not match");
    } else {
      setIsFetching(true);
      axios
        .post(`https://localhost:${PORT}/signup`, {
          email: document.getElementById("email").value,
          password: document.getElementById("password").value,
          preferredName: document.getElementById("preferredName").value,
          phoneNum: document.getElementById("phoneNum").value,
        })
        .then(function (response) {
          if (response.data.typeStatus === "success") {
            window.localStorage.setItem(
              "sessionToken",
              response.data.sessionToken
            );
            setCollegeList(response.data.colleges);
            navigate("/verify");
          }
          setIsFetching(false);
        })
        .catch(function (err) {
          console.log(err);
          setIsFetching(false);
        });
    }
  };

  const createVerifyParser = () => {
    if (
      !document.getElementById("firstName").value ||
      !document.getElementById("lastName").value ||
      !selectedCollegeOption ||
      !document.getElementById("DOB").value
    ) {
      alert("All fields are required");
    } else {
      setIsFetching(true);
      axios
        .post(`https://localhost:${PORT}/verify`, {
          sessionToken: window.localStorage.getItem("sessionToken"),
          firstName: document.getElementById("firstName").value,
          lastName: document.getElementById("lastName").value,
          university: selectedCollegeOption
            ? selectedCollegeOption.label
            : null,
          dob: document.getElementById("DOB").value,
        })
        .then(function (response) {
          setUserInfo(response.data.userInfo);
          navigate("/user/basic/edit");
          setIsFetching(false);
        })
        .catch(function (err) {
          console.log(err);
        });
    }
  };

  return (
    <div className="App">
      <main>
        <Navbar
          userInfo={userInfo}
          onClickLogout={logOut}
          onClickMatching={goToMatching}
          onClickLiked={goToLiked}
          goToBasic={goToBasic}
          goToSignUp={goToSignUp}
          goToLogin={goToLogin}
        />
        <div className="main-content">
          <Routes>
            <Route
              path="/login"
              element={
                <Login
                  onClickLogin={createLoginParser}
                  isFetching={isFetching}
                  onClickSignUp={goToSignUp}
                ></Login>
              }
            />
            <Route
              path="/signup"
              element={
                <SignUp
                  onClickSignUp={createSignUpParser}
                  onClickLogin={goToLogin}
                  isFetching={isFetching}
                ></SignUp>
              }
            />
            <Route
              path="/verify"
              element={
                <VerifyStudent
                  onClickVerify={createVerifyParser}
                  collegeList={collegeList}
                  selectedCollegeOption={selectedCollegeOption}
                  setSelectedCollegeOption={setSelectedCollegeOption}
                ></VerifyStudent>
              }
            />
            <Route
              path="/user/basic"
              element={
                <BasicInfo
                  userInfo={userInfo}
                  onClickInterests={goToInterests}
                  onClickMedia={goToMedia}
                  goToEditInfo={goToEditInfo}
                  isFetching={isFetching}
                ></BasicInfo>
              }
            />
            <Route
              path="/user/basic/edit"
              element={
                <BasicInfoEdit
                  userInfo={userInfo}
                  onClickInterests={goToInterests}
                  onClickMedia={goToMedia}
                  saveBasicInfo={saveBasicInfo}
                  setUserInfo={setUserInfo}
                  isFetching={isFetching}
                  selectedMajorOption={selectedMajorOption}
                  setSelectedMajorOption={setSelectedMajorOption}
                  majorList={majorList}
                ></BasicInfoEdit>
              }
            />
            <Route
              path="/user/interests"
              element={
                <Interests
                  userInfo={userInfo}
                  onClickBasic={goToBasic}
                  onClickMedia={goToMedia}
                  onClickEditInterests={goToEditInterests}
                  isFetching={isFetching}
                ></Interests>
              }
            />
            <Route
              path="/user/interests/edit"
              element={
                <InterestsEdit
                  userInfo={userInfo}
                  onClickBasic={goToBasic}
                  onClickMedia={goToMedia}
                  saveInterests={saveInterests}
                  getMovieSearch={getMovieSearch}
                  movie={movie}
                  removeMovie={removeMovie}
                  isFetching={isFetching}
                  getTVSearch={getTVSearch}
                  TV={TV}
                  removeShow={removeShow}
                  selectedHobbyOption={selectedHobbyOption}
                  setSelectedHobbyOption={setSelectedHobbyOption}
                  hobbiesList={hobbiesList}
                  removeHobby={removeHobby}
                  addNewHobby={addNewHobby}
                  onClickSpotify={getSpotifyAuth}
                ></InterestsEdit>
              }
            />
            <Route
              path="/user/media"
              element={
                <Media
                  userInfo={userInfo}
                  onClickBasic={goToBasic}
                  onClickInterests={goToInterests}
                  onClickEditMedia={goToEditMedia}
                  isFetching={isFetching}
                  onClickInsta={setupInsta}
                  getInstaPhotos={getInstaPhotos}
                  uploadInstaPhotos={uploadInstaPhotos}
                ></Media>
              }
            />
            <Route
              path="/user/media/edit"
              element={
                <MediaEdit
                  userInfo={userInfo}
                  onClickBasic={goToBasic}
                  onClickInterests={goToInterests}
                  imageList={userInfo.media ? userInfo.media : null}
                  maxImages={10}
                  setUserInfo={setUserInfo}
                  isFetching={isFetching}
                  setIsFetching={setIsFetching}
                ></MediaEdit>
              }
            />
            <Route
              path="/user/matching"
              element={
                <Matching
                  isFetching={isFetching}
                  userMatches={userMatches}
                  getMatchesForUser={getMatchesForUser}
                  matchOffset={matchOffset}
                  setOffset={setOffset}
                  matchLimit={MATCH_LIMIT}
                  goToMatching={goToMatching}
                  createMatches={createMatches}
                  setIsFetching={setIsFetching}
                  goToSuggest={goToSuggest}
                  setSuggestMatch={setSuggestMatch}
                  seeMoreMatches={seeMoreMatches}
                ></Matching>
              }
            />
            <Route path="*" element={<NotFound />} />
            <Route
              path="/insta-redirect"
              element={<InstaRedirect goToLogin={goToLogin} />}
            />
            <Route
              path="/spotify-redirect"
              element={<SpotifyRedirect goToLogin={goToLogin} />}
            />
            <Route path="/loading" element={<Loading />} />
            <Route path="/userTable" element={<UserTable />} />
            <Route
              path="/suggest"
              element={
                <Suggestions suggestMatch={suggestMatch} userInfo={userInfo} />
              }
            />
            <Route
              path="/user/liked"
              element={
                <Liked
                  isFetching={isFetching}
                  userMatches={userMatches}
                  getMatchesForUser={getMatchesForUser}
                  goToLiked={goToLiked}
                  createMatches={createMatches}
                  setIsFetching={setIsFetching}
                  goToSuggest={goToSuggest}
                  setSuggestMatch={setSuggestMatch}
                />
              }
            />
          </Routes>
        </div>
      </main>
    </div>
  );
}
