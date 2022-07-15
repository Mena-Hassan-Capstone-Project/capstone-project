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
  const MOVIE_SEARCH_URL = `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=`
  const TV_SEARCH_URL = `https://api.themoviedb.org/3/search/tv?api_key=${API_KEY}&query=`

  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState("")
  const [isFetching, setIsFetching] = useState(false)

  const [movie, setMovie] = useState("")
  const [TV, setTV] = useState("")
  const [hobbiesList, setHobbiesList] = useState([])
  const [selectedHobbyOption, setSelectedHobbyOption] = useState(null);

  const [userMatches, setUserMatches] = useState([]);
  const [matchOffset, setOffset] = useState(0);
  const matchLimit = 10

  const PORT = '3001'

  React.useEffect(() => {
    createMatches({})
    getMatchesForUser(10, 0)
  }, [userInfo]);

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
    setIsFetching(true)
    await axios.post(`http://localhost:${PORT}/matches`, {
      params : params
    })
    .then(function(response){
      setIsFetching(false)
    })
    .catch(function(err){
      console.log(err)
    })
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
    axios.get(`http://localhost:${PORT}/user/interests`)
    .then(resp => {
      setHobbiesList(resp.data.hobbiesList)
      setUserInfo({...userInfo, interests : {movies : resp.data.movies, shows : resp.data.shows, hobbies : resp.data.hobbies}})
      setIsFetching(false)
    });
  }

  //retrieves matches for user
  //sets user info
  async function getMatchesForUser(limit, offset) {
    if(!isFetching){
      setIsFetching(true)
      await axios.get(`http://localhost:${PORT}/matches`, {
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
    axios.post(`http://localhost:${PORT}/logout`, {
    })  
    .then(function(response){
      setUserInfo("")
      setUserMatches([])
      navigate('/login')
    })
    .catch(function(err){
      console.log(err)
    })
  }

  //remove movie from user movies
  //reloads interests
  function removeMovie (movie){
    setIsFetching(true)
    axios.post(`http://localhost:${PORT}/user/interests/remove`, {
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
    axios.post(`http://localhost:${PORT}/user/interests/remove`, {
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
    axios.post(`http://localhost:${PORT}/user/interests/remove`, {
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
    axios.post(`http://localhost:${PORT}/user/interests`, {
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

    await axios.post(`http://localhost:${PORT}/user/basic`, {
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
    await axios.post(`http://localhost:${PORT}/login`, {
      email: document.getElementById('email').value,
      password: document.getElementById('password').value
    })
    .then(function(response){
      setUserMatches([])
      setUserInfo(response.data.userInfo)
      navigate('/user/basic')
      setIsFetching(false)
    })
    .catch(function(err){
      console.log(err)
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
      axios.post(`http://localhost:${PORT}/signup`, {
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
    axios.post(`http://localhost:${PORT}/verify`, {
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
      <Navbar userInfo = {userInfo} logOut = {logOut} goToMatching={goToMatching} goToBasic={goToBasic}/>
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
        element = {<Media userInfo = {userInfo} goToBasic={goToBasic} goToInterests={goToInterests} goToEditMedia ={goToEditMedia} isFetching={isFetching}></Media>}
        />
        <Route 
        path = "/user/media/edit"
        element = {<MediaEdit userInfo = {userInfo} goToBasic={goToBasic} goToInterests={goToInterests} imageList={userInfo.media} maxImages = {10} setUserInfo={setUserInfo} isFetching={isFetching} setIsFetching={setIsFetching}></MediaEdit>}
        />
        <Route 
        path = "/user/matching"
        element = {<Matching isFetching = {isFetching} userMatches={userMatches} getMatchesForUser = {getMatchesForUser} matchOffset={matchOffset} setOffset={setOffset} matchLimit={matchLimit}></Matching>}
        />
        <Route path="*" element=
            {<NotFound />}
            />
      </Routes>
      </main>
    </div>
  );
}
