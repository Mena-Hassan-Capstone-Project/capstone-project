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

export default function App() {
  const API_KEY = "658568773162c3aaffcb3981d4f5587b"
  const BASE_URL = "https://api.themoviedb.org/3"
  const SEARCH_URL = BASE_URL + `/search/movie?api_key=${API_KEY}&query=`

  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState("")
  const [isFetching, setIsFetching] = useState(false)

  const [movie, setMovie] = useState("")

  const PORT = '3001'

  async function getResults(PAGE_URL){
    //fetch results for movies on page
    const response = await fetch(PAGE_URL)
    const result = await response.json()
    return result.results
}

const getSearch = () => {
  var query = document.getElementById('enter-movie').value
  if(query == ""){
    setMovie("")
    //setUserInfo({...userInfo, interests : {}});
  }
  setIsFetching(true)
  getResults(SEARCH_URL + query)
  .then(function(response){
    console.log(response)
    setMovie(response[0])
    //setUserInfo({...userInfo, interests : {movies : movies}})
    console.log("userInfo", userInfo)
    setIsFetching(false)
  })
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
    getMoviesFromUser()
    navigate('/user/interests')
  }

  const goToMedia = () => {
    navigate('/user/media')
  }

  function getMoviesFromUser() {
    setIsFetching(true)
    axios.get(`http://localhost:${PORT}/user/interests`)
    .then(resp => {
      console.log(resp.data);
      setUserInfo({...userInfo, interests : {movies : resp.data}})
      setIsFetching(false)
    });
  }

  const logOut = () => {
    axios.post(`http://localhost:${PORT}/logout`, {
    })
    .then(function(response){
      console.log(response)
      setUserInfo("")
      navigate('/login')
    })
    .catch(function(err){
      console.log(err)
    })
  }

  function removeMovie (movie){
    setIsFetching(true)
    axios.post(`http://localhost:${PORT}/user/interests/remove`, {
      movie : movie
    })
    .then(function(response){
      console.log("response:", response)
      getMoviesFromUser()
      setIsFetching(false)
    })
    .catch(function(err){
      console.log(err)
    })
  }

  const saveInterests = () => {
    setIsFetching(true)
    axios.post(`http://localhost:${PORT}/user/interests`, {
      interests : {
        movie : movie
      }
    })
    .then(function(response){
      console.log("Edited data:", response)
      getMoviesFromUser()
      navigate('/user/interests')
      setIsFetching(false)
    })
    .catch(function(err){
      console.log(err)
    })
  }

  const saveBasicInfo = () => {
    setIsFetching(true)
    var tags = []
    if(userInfo.tags){
      tags = userInfo.tags
    }
    console.log("tags", tags)
    if(tags.indexOf(document.getElementById('tags').value) == -1){
      tags.push(document.getElementById('tags').value)
    }

    axios.post(`http://localhost:${PORT}/user/basic`, {
      year: document.getElementById('year').value,
      major: document.getElementById('major').value,
      hometown: document.getElementById('hometown').value,
      tags: tags,
    })
    .then(function(response){
      console.log("Edited data:", response)
      setUserInfo(response.data.userInfo)
      navigate('/user/basic')
      setIsFetching(false)
    })
    .catch(function(err){
      console.log(err)
    })
  }

  const createLoginParser = () => {
    setIsFetching(true)
    axios.post(`http://localhost:${PORT}/login`, {
      email: document.getElementById('email').value,
      password: document.getElementById('password').value
    })
    .then(function(response){
      console.log(response)
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
    axios.post(`http://localhost:${PORT}/signup`, {
      email: document.getElementById('email').value,
      password: document.getElementById('password').value,
      preferredName: document.getElementById('preferredName').value
    })
    .then(function(response){
      console.log(response.data)
      if(response.data.typeStatus === "success"){
        navigate('/verify')
      }
      setIsFetching(false)
    })
    .catch(function(err){
      console.log(err)
    })
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
      console.log(response.data.userInfo)
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
      <Navbar userInfo = {userInfo} logOut = {logOut}/>
      <Routes>
        <Route 
        path = "/login"
        element = {<Login createLoginParser = {createLoginParser}></Login>}
        />
        <Route 
        path = "/signup"
        element = {<SignUp createSignUpParser = {createSignUpParser}></SignUp>}
        />
        <Route 
        path = "/verify"
        element = {<VerifyStudent createVerifyParser = {createVerifyParser}></VerifyStudent>}
        />
        <Route 
        path = "/user/basic"
        element = {<BasicInfo userInfo = {userInfo} goToInterests={goToInterests} goToMedia={goToMedia} goToEditInfo={goToEditInfo}></BasicInfo>}
        />
        <Route 
        path = "/user/basic/edit"
        element = {<BasicInfoEdit userInfo = {userInfo} saveBasicInfo={saveBasicInfo} setUserInfo = {setUserInfo}></BasicInfoEdit>}
        />
        <Route 
        path = "/user/interests"
        element = {<Interests userInfo = {userInfo} goToBasic={goToBasic} goToMedia={goToMedia} gotToEditInterests={goToEditInterests}></Interests>}
        />
        <Route 
        path = "/user/interests/edit"
        element = {<InterestsEdit userInfo = {userInfo} goToBasic={goToBasic} goToMedia={goToMedia} saveInterests={saveInterests} getSearch={getSearch} movie= {movie} setUserInfo={setUserInfo} removeMovie={removeMovie}></InterestsEdit>}
        />
        <Route 
        path = "/user/media"
        element = {<Media userInfo = {userInfo} goToBasic={goToBasic} goToInterests={goToInterests} goToEditMedia ={goToEditMedia}></Media>}
        />
        <Route 
        path = "/user/media/edit"
        element = {<MediaEdit userInfo = {userInfo} goToBasic={goToBasic} goToInterests={goToInterests} imageList={userInfo.media} maxImages = {10} setUserInfo={setUserInfo}></MediaEdit>}
        />
      </Routes>
      </main>
    </div>
  );
}
