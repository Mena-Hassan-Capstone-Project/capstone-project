import * as React from "react"
import {Route, Routes, useNavigate} from 'react-router-dom'
import { useState } from "react";
import './App.css';
import axios from "axios"
import Login from '../Login/Login'
import SignUp from '../SignUp/SignUp'
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

export default function App() {
  const API_KEY = "658568773162c3aaffcb3981d4f5587b"
  const INSTA_APP_ID = "390997746348889"
  const INSTA_APP_SECRET = "facb6a96ac24a92b82f0a6b254c0ec69"
  const MOVIE_SEARCH_URL = `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=`
  const TV_SEARCH_URL = `https://api.themoviedb.org/3/search/tv?api_key=${API_KEY}&query=`

  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState("")
  const [isFetching, setIsFetching] = useState(false)

  const [movie, setMovie] = useState("")
  const [TV, setTV] = useState("")
  const [hobbiesList, setHobbiesList] = useState("")
  const [selectedHobbyOption, setSelectedHobbyOption] = useState(null);

  const [userMatches, setUserMatches] = useState([]);
  const [matchOffset, setOffset] = useState(0);
  const matchLimit = 10

  const [accessToken, setAccessToken] = useState();
  const [currentUrl, setCurrentUrl] = useState()

  const PORT = '3001'

  React.useEffect(() => {
    createMatches({})
    getMatchesForUser(10, 0)
  }, [userInfo]);

  React.useEffect(() => {
    setIsFetching(true)
    if (window.performance) {
      if (String(window.performance.getEntriesByType("navigation")[0].type) === "reload") {
        const loggedInUser = window.localStorage.getItem('userInfo');
        if (loggedInUser) {
          const foundUser = JSON.parse(loggedInUser)
          setIsFetching(true)
          axios.post(`https://localhost:${PORT}/login`, {
            email: foundUser.email,
            password: foundUser.password
          })
          .then(function(response){
            setUserInfo(response.data.userInfo)
            setUserMatches([])
          })
          .catch(function(err){
            console.log(err)
            setIsFetching(false)
          })
    }
    setIsFetching(false)
      }
    }
  }, [accessToken]);

  React.useEffect(() => {
    if(userInfo && userInfo != "" && currentUrl){
      postInsta(currentUrl)
    }
  }, [currentUrl]);

// Invoke this function on button click or whatever other use case
async function setupInsta(){
	let appId = INSTA_APP_ID;
	let redUri = window.location.origin + "/user/basic";
	let url = `https://api.instagram.com/oauth/authorize?client_id=${appId}&redirect_uri=${redUri}&scope=user_profile,user_media&response_type=code`;
	window.open(url, "_blank").focus();
  setCurrentUrl(redUri)
}

function postInsta(redUri){
  const queryString = window.location.href;
  const urlParams = new URLSearchParams(queryString);
  setIsFetching(true)
  axios.post(`https://localhost:${PORT}/init-insta`, {
    code: urlParams.get('code'),
    redirectUrl: redUri, // needs to be registered at fb developer console
    userInfo : userInfo
  })
  .then(({ data }) => {
    if(data.accessToken){
      getAccessToken(data.accessToken)
    }
    setUserInfo(data.userInfo)
    setIsFetching(false)
  })
  .catch(({ error }) => {
    console.log("error", error)
    setIsFetching(false)
  })
}


//get long term access token from short term access token
function getAccessToken(accessToken){
  try {
    axios.get(`https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${INSTA_APP_SECRET}&access_token=${accessToken}`)
    .then(function(response){
      accessToken = response.data.access_token;
    })
    // save accessToken  to Database
} catch (e) {
    console.log("Error getting long term access token", e);
}
}


  async function getInstaData(){
    try {
      let instaAccessToken = accessToken;
      let resp = await axios.get(`https://graph.instagram.com/me/media?fields=media_type,permalink,media_url&access_token=${instaAccessToken}`);
      resp = resp.data;
      let instaPhotos = resp.data.filter(d => d.media_type === "IMAGE").map(d => d.media_url);
    } catch (e) {
       console.log(e.response.data.error);
    }
  }

  //fetch results for movies on page using TMDB API
  async function getResults(PAGE_URL){
    const response = await fetch(PAGE_URL)
    const result = await response.json()
    return result.results
  }


  //gets search result from api for interests movie search bar
  const getMovieSearch = () => {
    const query = document.getElementById('enter-movie').value
    if(query === ""){
      setMovie("")
    }
    getResults(MOVIE_SEARCH_URL + query)
    .then(function(response){
      setMovie(response[0])
      setIsFetching(false)
    })
}

  //gets tv result from api for interests movie search bar
  const getTVSearch = () => {
    const query = document.getElementById('enter-tv').value
    if(query === ""){
      setTV("")
    }
    getResults(TV_SEARCH_URL + query)
    .then(function(response){
      setTV(response[0])
      setIsFetching(false)
    })
  }

  //creates matches for current user
  async function createMatches (params){
    if(userInfo != "" && userInfo && !String(window.performance.getEntriesByType("navigation")[0].type) === "reload"){
      setIsFetching(true)
      await axios.post(`https://localhost:${PORT}/matches`, {
        params : params
      })
      .then(function(response){
        setIsFetching(false)
      })
      .catch(function(err){
        console.log(err)
      })
    }
  }

  //navigate to pages
  const goToSignUp = () => {
    navigate('/signup')
  }

  const goToLogin = () => {
    navigate('/login')
  }

  const goToBasic = () => {
    navigate('/user/basic')
  }

  const goToEditInfo = () => {
    navigate('/user/basic/edit')
  }

  const goToEditMedia = () => {
    navigate('/user/media/edit')
  }

  const goToEditInterests = () => {
    setMovie("")
    navigate('/user/interests/edit')
  }

  const goToInterests = () => {
    getInterestsFromUser()
    navigate('/user/interests')
  }

  const goToMedia = () => {
    navigate('/user/media')
  }

  const goToMatching = () => {
    navigate('/user/matching')
  }

  //retrieves movies, tv shows, and hobbies for user
  //sets user info
  function getInterestsFromUser() {
    setIsFetching(true)
    axios.get(`https://localhost:${PORT}/user/interests`)
    .then(resp => {
      setHobbiesList(resp.data.hobbiesList)
      setUserInfo({...userInfo, interests : {movies : resp.data.movies, shows : resp.data.shows, hobbies : resp.data.hobbies}})
      setIsFetching(false)
    });
  }

  //retrieves matches for user
  //sets user info
  async function getMatchesForUser(limit, offset) {
    if(!isFetching && userInfo && userInfo != ""){
      setIsFetching(true)
      await axios.get(`https://localhost:${PORT}/matches`, {
        params: {
          limit: limit,
          offset: offset
        }
      })
      .then(resp => {
        if(offset == 0){
          setUserMatches(resp.data.matchesInfo)
        }
        else if(userMatches.length >= 10 && resp.data.matchesInfo[0] && !userMatches.includes(resp.data.matchesInfo[0])){
          let newMatches = userMatches.concat(resp.data.matchesInfo)
          setUserMatches(newMatches)
        }
        setIsFetching(false)
      });
      }
  }

  //log user out
  const logOut = () => {
    axios.post(`https://localhost:${PORT}/logout`, {
    })  
    .then(function(response){
      setUserInfo("")
      setUserMatches([])
      navigate('/login')
      window.localStorage.clear();
    })
    .catch(function(err){
      console.log(err)
      window.localStorage.clear();
    })
  }

  //remove movie from user movies
  //reloads interests
  function removeMovie (movie){
    setIsFetching(true)
    axios.post(`https://localhost:${PORT}/user/interests/remove`, {
      movie : movie
    })
    .then(function(response){
      getInterestsFromUser()
      setIsFetching(false)
    })
    .catch(function(err){
      console.log(err)
    })
  }

  //remove show from user shows
  //reloads interests
  function removeShow (show){
    setIsFetching(true)
    axios.post(`https://localhost:${PORT}/user/interests/remove`, {
      show : show
    })
    .then(function(response){
      getInterestsFromUser()
      setIsFetching(false)
    })
    .catch(function(err){
      console.log(err)
    })
  }

  //remove hobby from user hobbies
  //reloads interests
  function removeHobby (hobby){
    setIsFetching(true)
    axios.post(`https://localhost:${PORT}/user/interests/remove`, {
      hobby : hobby
    })
    .then(function(response){
      getInterestsFromUser()
      setIsFetching(false)
    })
    .catch(function(err){
      console.log(err)
    })
  }


  //sends user interests to backend
  //reloads interests
  const saveInterests = () => {
    setIsFetching(true)
    axios.post(`https://localhost:${PORT}/user/interests`, {
      interests : {
        movie : movie,
        TV : TV,
        hobby : selectedHobbyOption 
        ? selectedHobbyOption.value
        : null
      }
    })
    .then(function(response){
      getInterestsFromUser()
      navigate('/user/interests')
      setMovie("")
      setTV("")
      setIsFetching(false)
    })
    .catch(function(err){
      console.log(err)
    })
  }

  //sends basic info to backend
  const saveBasicInfo = async () => {
    setIsFetching(true)
    var tags = []
    if(userInfo.tags){
      tags = userInfo.tags
    }
    if(tags.indexOf(document.getElementById('tags').value) === -1){
      tags.push(document.getElementById('tags').value)
    }

    if(document.getElementById('tags').value === 'None'){
      tags = []
    }

    await axios.post(`https://localhost:${PORT}/user/basic`, {
      year: document.getElementById('year').value,
      major: document.getElementById('major').value,
      hometown: document.getElementById('hometown').value,
      tags: tags,
    })
    .then(function(response){
      setUserInfo(response.data.userInfo)
      navigate('/user/basic')
      setIsFetching(false)
    })
    .catch(function(err){
      console.log(err)
    })
  }

  const createLoginParser = async () => {
    setIsFetching(true)
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    await axios.post(`https://localhost:${PORT}/login`, {
      email: email,
      password: password
    })
    .then(function(response){
      if(response.data.typeStatus == "danger"){
        alert("Login error")
        navigate('/user/login')
        setIsFetching(false)
      }
      else{
        window.localStorage.clear();
        setUserInfo(response.data.userInfo)
        window.localStorage.setItem('userInfo', JSON.stringify({email: email, password: password}))
        setUserMatches([])
        navigate('/user/basic')
        setIsFetching(false)
      }
    })
    .catch(function(err){
      console.log(err)
      window.localStorage.clear();
    })
  }

  const createSignUpParser = () => {
    setIsFetching(true)
    if(!document.getElementById('email').value.endsWith('.edu')){
      alert('Please enter a valid .edu email')
    }
    else if(document.getElementById('password').value !== document.getElementById('confirm-password').value){
      alert('Passwords do not match')
    }
    else{
      axios.post(`https://localhost:${PORT}/signup`, {
      email: document.getElementById('email').value,
      password: document.getElementById('password').value,
      preferredName: document.getElementById('preferredName').value
      })
      .then(function(response){
        if(response.data.typeStatus === "success"){
          navigate('/verify')
        }
        setIsFetching(false)
      })
      .catch(function(err){
        console.log(err)
      })
    }
  }

  const createVerifyParser = () => {
    setIsFetching(true)
    axios.post(`https://localhost:${PORT}/verify`, {
      firstName: document.getElementById('firstName').value,
      lastName: document.getElementById('lastName').value,
      university: document.getElementById('university').value,
      dob: document.getElementById('DOB').value
    })
    .then(function(response){
      setUserInfo(response.data.userInfo)
      navigate('/user/basic/edit')
      setIsFetching(false)
    })
    .catch(function(err){
      console.log(err)
    })
  }

  return (
    <div className="App">
      <main>
      <Navbar userInfo = {userInfo} logOut = {logOut} goToMatching={goToMatching} goToBasic={goToBasic} goToSignUp={goToSignUp}/>
      <Routes>
        <Route 
        path = "/login"
        element = {<Login createLoginParser = {createLoginParser} isFetching={isFetching} goToSignUp={goToSignUp}></Login>}
        />
        <Route 
        path = "/signup"
        element = {<SignUp createSignUpParser = {createSignUpParser} goToLogin={goToLogin}></SignUp>}
        />
        <Route 
        path = "/verify"
        element = {<VerifyStudent createVerifyParser = {createVerifyParser}></VerifyStudent>}
        />
        <Route 
        path = "/user/basic"
        element = {<BasicInfo userInfo = {userInfo} goToInterests={goToInterests} goToMedia={goToMedia} goToEditInfo={goToEditInfo} isFetching={isFetching}></BasicInfo>}
        />
        <Route 
        path = "/user/basic/edit"
        element = {<BasicInfoEdit userInfo = {userInfo} saveBasicInfo={saveBasicInfo} setUserInfo = {setUserInfo} isFetching={isFetching}></BasicInfoEdit>}
        />
        <Route 
        path = "/user/interests"
        element = {<Interests userInfo = {userInfo} goToBasic={goToBasic} goToMedia={goToMedia} gotToEditInterests={goToEditInterests} isFetching={isFetching}></Interests>}
        />
        <Route 
        path = "/user/interests/edit"
        element = {<InterestsEdit userInfo = {userInfo} goToBasic={goToBasic} goToMedia={goToMedia} saveInterests={saveInterests} getMovieSearch={getMovieSearch} movie= {movie} 
        removeMovie={removeMovie} isFetching={isFetching} getTVSearch={getTVSearch} TV={TV} removeShow={removeShow} selectedHobbyOption={selectedHobbyOption} 
        setSelectedHobbyOption={setSelectedHobbyOption} hobbiesList={hobbiesList} removeHobby={removeHobby}></InterestsEdit>}
        />
        <Route 
        path = "/user/media"
        element = {<Media userInfo = {userInfo} goToBasic={goToBasic} goToInterests={goToInterests} goToEditMedia ={goToEditMedia} isFetching={isFetching} setupInsta = {setupInsta}></Media>}
        />
        <Route 
        path = "/user/media/edit"
        element = {<MediaEdit userInfo = {userInfo} goToBasic={goToBasic} goToInterests={goToInterests} imageList={userInfo.media} maxImages = {10} setUserInfo={setUserInfo} isFetching={isFetching} setIsFetching={setIsFetching}></MediaEdit>}
        />
        <Route 
        path = "/user/matching"
        element = {<Matching isFetching = {isFetching} userMatches={userMatches} getMatchesForUser = {getMatchesForUser} matchOffset={matchOffset} setOffset={setOffset} matchLimit={matchLimit} 
        goToMatching={goToMatching} createMatches = {createMatches} setIsFetching={setIsFetching}></Matching>}
        />
        <Route path="*" element=
            {<NotFound />}
            />
      </Routes>
      </main>
    </div>
  );
}
