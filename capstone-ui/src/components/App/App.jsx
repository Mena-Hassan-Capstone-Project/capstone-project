import * as React from "react"
import { Route, Routes, useNavigate } from 'react-router-dom';
import { useState } from "react";
import './App.css';
import axios from "axios";
import Login from '../Login/Login';
import SignUp from '../SignUp/SignUp';
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

export default function App() {
  const API_KEY = "658568773162c3aaffcb3981d4f5587b";
  const INSTA_APP_ID = "390997746348889";
  const RED_URI = "https://localhost:3000/insta-redirect";
  const INSTA_APP_SECRET = "facb6a96ac24a92b82f0a6b254c0ec69";
  const MOVIE_SEARCH_URL = `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=`;
  const TV_SEARCH_URL = `https://api.themoviedb.org/3/search/tv?api_key=${API_KEY}&query=`;

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
  const matchLimit = 2;
  const [fetchingMatches, setFetchingMatches] = useState(false);

  const PORT = '3001';

  //update matches when user info changes
  React.useEffect(() => {
    if (userInfo.interests && userInfo.preferredName) {
      if (userMatches.length == 0 && !fetchingMatches) {
        createMatches({})
      }
      getMatchesForUser(matchLimit, 0);
    }
  }, [userInfo]);

  /*React.useEffect(() => {
    setIsFetching(true);
    if (window.performance) {
      if (window.localStorage.getItem('userInfo') && !userInfo) {
        refreshLogin();
      }
    }
    setIsFetching(false);
  }, []);*/

  React.useEffect(() => {
    if (window.location.href.includes("code") && !isFetching && !userInfo.ig_accessToken) {
      postInsta();
    }
  }, []);

  function refreshLogin() {
    setIsFetching(true);
    const loggedInUser = window.localStorage.getItem('userInfo');
    if (loggedInUser) {
      const foundUser = JSON.parse(loggedInUser);
      axios.post(`https://localhost:${PORT}/login`, {
        email: foundUser.email,
        password: foundUser.password
      })
        .then(function (response) {
          setUserInfo(response.data.userInfo);
          setUserMatches([]);
          setIsFetching(false);
        })
        .catch(function (err) {
          console.log(err);
          setIsFetching(false);
        })
    }
  }

  async function getInstaUsername(accessToken) {
    try {
      let resp = await axios.get(`https://graph.instagram.com/me?fields=id,username&access_token=${accessToken}`)
      return resp.data.username
    } catch (e) {
      console.log(e.response.data.error);
    }
  }

  // Invoke this function on button click or whatever other use case
  async function setupInsta() {
    let appId = INSTA_APP_ID;
    let url = `https://api.instagram.com/oauth/authorize?client_id=${appId}&redirect_uri=${RED_URI}&scope=user_profile,user_media&response_type=code`;
    window.open(url, "_blank").focus();
  }

  async function postInsta() {
    setIsFetching(true);

    const queryString = window.location.href;
    const code = queryString.split("?code=")[1].slice(0, -2);
    await axios.post(`https://localhost:${PORT}/init-insta`, {
      code: code,
      redirectUri: RED_URI, // needs to be registered at fb developer console
    })
      .then(({ data }) => {
        if (data.accessToken) {
          getAccessToken(data.accessToken);
        }
      })
      .catch(({ error }) => {
        console.log("error", error);
      })
    setIsFetching(false);
  }


  //get long term access token from short term access token
  function getAccessToken(accessToken) {
    if (!isFetching) {
      setIsFetching(true);
      try {
        axios.get(`https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${INSTA_APP_SECRET}&access_token=${accessToken}`)
          .then(async function (response) {
            accessToken = response.data.access_token;
            let username = await getInstaUsername(accessToken)
            axios.post(`https://localhost:${PORT}/user/update`, {
              accessToken: accessToken,
              username: username
            }).then(function (response) {
              setIsFetching(false);
            })
          })
      } catch (e) {
        console.log("Error getting long term access token", e);
      }
    }
  }

  //get long term access token from short term access token
  function uploadInstaPhotos(photos) {
    axios.post(`https://localhost:${PORT}/user/update`, {
      photos: photos
    }).then(function (response) {
      setIsFetching(false);
    })
  }


  async function getInstaPhotos(accessToken) {
    try {
      let resp = await axios.get(`https://graph.instagram.com/me/media?fields=media_type,permalink,media_url&access_token=${accessToken}`);
      resp = resp.data;
      let instaPhotos = resp.data.map(d => d.media_url);
      return instaPhotos;
    } catch (e) {
      return e.response.data.error;
    }
  }

  //fetch results for movies on page using TMDB API
  async function getResults(PAGE_URL) {
    const response = await fetch(PAGE_URL);
    const result = await response.json();
    return result.results;
  }


  //gets search result from api for interests movie search bar
  const getMovieSearch = () => {
    const query = document.getElementById('enter-movie').value;
    if (query === "") {
      setMovie("");
    }
    getResults(MOVIE_SEARCH_URL + query)
      .then(function (response) {
        setMovie(response[0]);
        setIsFetching(false);
      })
  }

  //gets tv result from api for interests movie search bar
  const getTVSearch = () => {
    const query = document.getElementById('enter-tv').value;
    if (query === "") {
      setTV("");
    }
    getResults(TV_SEARCH_URL + query)
      .then(function (response) {
        setTV(response[0]);
        setIsFetching(false);
      })
  }

  function addNewHobby(category, hobbyIndex) {
    if (document.getElementById('enter-hobby')) {
      setNewHobby({ name: document.getElementById('enter-hobby').value, category: category, hobbyIndex: hobbyIndex });
    }
  }

  //creates matches for current user
  async function createMatches(params) {
    setFetchingMatches(true)
    if (userInfo && userInfo != 0) {
      await axios.post(`https://localhost:${PORT}/matches`, {
        params: params
      })
        .then(function (response) {
          console.log("matches created", response)
        })
        .catch(function (err) {
          console.log(err);
        })
    }
    setFetchingMatches(false)
  }

  //navigate to pages
  const goToSignUp = () => {
    navigate('/signup');
  }

  const goToLogin = () => {
    navigate('/login');
  }

  const goToBasic = () => {
    navigate('/user/basic');
  }

  const goToEditInfo = () => {
    navigate('/user/basic/edit');
  }

  const goToEditMedia = () => {
    navigate('/user/media/edit');
  }

  const goToEditInterests = () => {
    setMovie("")
    navigate('/user/interests/edit');
  }

  const goToInterests = () => {
    if (!userInfo.interests) {
      setTimeout(getInterestsFromUser, 1000)
    }
    setIsFetching(false)
    navigate('/user/interests')

  }

  const goToMedia = () => {
    navigate('/user/media');
  }

  const goToMatching = () => {
    if (userMatches.length === 0) {
      createMatches({})
      getMatchesForUser(matchLimit, 0);
    }
    navigate('/user/matching');
  }

  //retrieves movies, tv shows, and hobbies for user
  //sets user info
  async function getInterestsFromUser() {
    //setIsFetching(true);
    await axios.get(`https://localhost:${PORT}/user/interests`)
      .then(resp => {
        if (resp.data.movies && userInfo) {
          setHobbiesList(resp.data.hobbiesList);
          setUserInfo({ ...userInfo, interests: { movies: resp.data.movies, shows: resp.data.shows, hobbies: resp.data.hobbies } });
          setIsFetching(false)
        }
        else if (resp.data.typeStatus == "danger") {
          setIsFetching(false);
        }
      });
  }

  //retrieves matches for user
  //sets user info
  async function getMatchesForUser(limit, offset) {
    if (!isFetching && userInfo && userInfo != "") {
      //setIsFetching(true);
      await axios.get(`https://localhost:${PORT}/matches`, {
        params: {
          limit: limit,
          offset: offset
        }
      })
        .then(resp => {
          if (resp.data.typeStatus == "success") {
            if (offset == 0) {
              setUserMatches(resp.data.matchesInfo);
            }
            else if (userMatches.length >= matchLimit && resp.data.matchesInfo[0] && !userMatches.includes(resp.data.matchesInfo[0])) {
              let newMatches = userMatches.concat(resp.data.matchesInfo);
              setUserMatches(newMatches);
            }
          }
          //setIsFetching(false);
        });
    }
  }

  //log user out
  function logOut() {
    axios.post(`https://localhost:${PORT}/logout`, {
    })
      .then(function (response) {
        setUserInfo("");
        setUserMatches([]);
        window.localStorage.clear();
        navigate('/login');
        setIsFetching(false)
      })
      .catch(function (err) {
        console.log(err);
        window.localStorage.clear();
        setIsFetching(false)
      })
  }

  //remove movie from user movies
  //reloads interests
  function removeMovie(movie) {
    setIsFetching(true);
    axios.post(`https://localhost:${PORT}/user/interests/remove`, {
      movie: movie
    })
      .then(function (response) {
        getInterestsFromUser();
        setIsFetching(false);
      })
      .catch(function (err) {
        console.log(err);
      })
  }

  //remove show from user shows
  //reloads interests
  function removeShow(show) {
    setIsFetching(true);
    axios.post(`https://localhost:${PORT}/user/interests/remove`, {
      show: show
    })
      .then(function (response) {
        getInterestsFromUser();
        setIsFetching(false);
      })
      .catch(function (err) {
        console.log(err);
      })
  }

  //remove hobby from user hobbies
  //reloads interests
  function removeHobby(hobby) {
    setIsFetching(true);
    axios.post(`https://localhost:${PORT}/user/interests/remove`, {
      hobby: hobby
    })
      .then(function (response) {
        getInterestsFromUser();
        setIsFetching(false);
      })
      .catch(function (err) {
        console.log(err);
      })
  }


  //sends user interests to backend
  //reloads interests
  const saveInterests = () => {
    setIsFetching(true);
    axios.post(`https://localhost:${PORT}/user/interests`, {
      interests: {
        movie: movie,
        TV: TV,
        hobby: selectedHobbyOption
          ? selectedHobbyOption.value
          : newHobby ?
            newHobby
            : null
      }
    })
      .then(function (response) {
        getInterestsFromUser();
        navigate('/user/interests');
        setMovie("");
        setTV("");
        setIsFetching(false);
      })
      .catch(function (err) {
        console.log(err);
      })
  }

  function setFetchingFalse() {
    setIsFetching(false)
  }

  //sends basic info to backend
  const saveBasicInfo = async () => {
    setIsFetching(true);
    var tags = [];
    if (userInfo.tags) {
      tags = userInfo.tags;
    }
    if (tags.indexOf(document.getElementById('tags').value) === -1 && document.getElementById('tags').value !== 'None') {
      tags.push(document.getElementById('tags').value);
    }

    await axios.post(`https://localhost:${PORT}/user/basic`, {
      year: document.getElementById('year').value,
      major: document.getElementById('major').value,
      hometown: document.getElementById('hometown').value,
      tags: tags,
    })
      .then(function (response) {
        setUserInfo(response.data.userInfo);
        navigate('/user/basic');
        setIsFetching(false);
      })
      .catch(function (err) {
        console.log(err);
      })
  }

  const createLoginParser = async () => {
    window.localStorage.clear()
    setIsFetching(true);
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    await axios.post(`https://localhost:${PORT}/login`, {
      email: email,
      password: password
    })
      .then(function (response) {
        if (response.data.typeStatus == "danger") {
          alert("Login error");
        }
        else {
          setUserInfo(response.data.userInfo);
          window.localStorage.setItem('userInfo', JSON.stringify({ email: email, password: password, objectId: response.data.userInfo.objectId }));
          refreshLogin()
          setUserMatches([]);
          setSelectedHobbyOption(null)
          setOffset(0)
          setTimeout(getInterestsFromUser, 2000)
          setTimeout(setFetchingFalse, 2000)
          navigate('/user/basic');
          //setIsFetching(false);
        }
        setIsFetching(false)
      })
      .catch(function (err) {
        console.log(err);
        window.localStorage.clear();
        setIsFetching(false);
      })
  }

  const createSignUpParser = () => {
    if (!document.getElementById('email').value.endsWith('.edu')) {
      alert('Please enter a valid .edu email');
    }
    else if (document.getElementById('password').value !== document.getElementById('confirm-password').value) {
      alert('Passwords do not match');
    }
    else {
      setIsFetching(true)
      axios.post(`https://localhost:${PORT}/signup`, {
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
        preferredName: document.getElementById('preferredName').value,
        phoneNum: document.getElementById('phoneNum').value
      })
        .then(function (response) {
          if (response.data.typeStatus === "success") {
            navigate('/verify');
          }
          setIsFetching(false);
        })
        .catch(function (err) {
          console.log(err);
        })
    }
  }

  const createVerifyParser = () => {
    setIsFetching(true);
    axios.post(`https://localhost:${PORT}/verify`, {
      firstName: document.getElementById('firstName').value,
      lastName: document.getElementById('lastName').value,
      university: document.getElementById('university').value,
      dob: document.getElementById('DOB').value
    })
      .then(function (response) {
        setUserInfo(response.data.userInfo);
        navigate('/user/basic/edit');
        setIsFetching(false);
      })
      .catch(function (err) {
        console.log(err);
      })
  }

  return (
    <div className="App">
      <main>
        <Navbar userInfo={userInfo} onClickLogout={logOut} onClickMatching={goToMatching} goToBasic={goToBasic} goToSignUp={goToSignUp} goToLogin={goToLogin} />
        <Routes>
          <Route
            path="/login"
            element={<Login onClickLogin={createLoginParser} isFetching={isFetching} onClickSignUp={goToSignUp}></Login>}
          />
          <Route
            path="/signup"
            element={<SignUp onClickSignUp={createSignUpParser} onClickLogin={goToLogin} isFetching={isFetching}></SignUp>}
          />
          <Route
            path="/verify"
            element={<VerifyStudent onClickVerify={createVerifyParser}></VerifyStudent>}
          />
          <Route
            path="/user/basic"
            element={<BasicInfo userInfo={userInfo} onClickInterests={goToInterests} onClickMedia={goToMedia} goToEditInfo={goToEditInfo} isFetching={isFetching}></BasicInfo>}
          />
          <Route
            path="/user/basic/edit"
            element={<BasicInfoEdit userInfo={userInfo} onClickInterests={goToInterests} onClickMedia={goToMedia} saveBasicInfo={saveBasicInfo} setUserInfo={setUserInfo} isFetching={isFetching}></BasicInfoEdit>}
          />
          <Route
            path="/user/interests"
            element={<Interests userInfo={userInfo} onClickBasic={goToBasic} onClickMedia={goToMedia} onClickEditInterests={goToEditInterests} isFetching={isFetching}></Interests>}
          />
          <Route
            path="/user/interests/edit"
            element={<InterestsEdit userInfo={userInfo} onClickBasic={goToBasic} onClickMedia={goToMedia} saveInterests={saveInterests} getMovieSearch={getMovieSearch} movie={movie}
              removeMovie={removeMovie} isFetching={isFetching} getTVSearch={getTVSearch} TV={TV} removeShow={removeShow} selectedHobbyOption={selectedHobbyOption}
              setSelectedHobbyOption={setSelectedHobbyOption} hobbiesList={hobbiesList} removeHobby={removeHobby} addNewHobby={addNewHobby}></InterestsEdit>}
          />
          <Route
            path="/user/media"
            element={<Media userInfo={userInfo} onClickBasic={goToBasic} onClickInterests={goToInterests} onClickEditMedia={goToEditMedia} isFetching={isFetching} onClickInsta={setupInsta} getInstaPhotos={getInstaPhotos} uploadInstaPhotos={uploadInstaPhotos}></Media>}
          />
          <Route
            path="/user/media/edit"
            element={<MediaEdit userInfo={userInfo} onClickBasic={goToBasic} onClickInterests={goToInterests} imageList={userInfo.media} maxImages={10} setUserInfo={setUserInfo} isFetching={isFetching} setIsFetching={setIsFetching}></MediaEdit>}
          />
          <Route
            path="/user/matching"
            element={<Matching isFetching={isFetching} userMatches={userMatches} getMatchesForUser={getMatchesForUser} matchOffset={matchOffset} setOffset={setOffset} matchLimit={matchLimit}
              goToMatching={goToMatching} createMatches={createMatches} setIsFetching={setIsFetching}></Matching>}
          />
          <Route path="*" element=
            {<NotFound />}
          />
          <Route path="/insta-redirect" element=
            {<InstaRedirect />}
          />
          <Route
            path="/loading"
            element={<Loading></Loading>}
          />
        </Routes>
      </main>
    </div>
  );
}
