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

export default function App() {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState("")

  const PORT = '3001'

  const saveBasicInfo = () => {
    axios.post(`http://localhost:${PORT}/user/basic`, {
      year: document.getElementById('year').value,
      major: document.getElementById('major').value,
      hometown: document.getElementById('hometown').value,
      profile_photo : ""
    })
    .then(function(response){
      console.log("Edited data:", response)
      setUserInfo(response.data.userInfo)
      navigate('/user/basic')
    })
    .catch(function(err){
      console.log(err)
    })
  }

  const createLoginParser = () => {
    axios.post(`http://localhost:${PORT}/login`, {
      email: document.getElementById('email').value,
      password: document.getElementById('password').value
    })
    .then(function(response){
      console.log(response)
      setUserInfo(response.data.userInfo)
      navigate('/user/basic')
    })
    .catch(function(err){
      console.log(err)
    })
  }

  const createSignUpParser = () => {
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
    })
    .catch(function(err){
      console.log(err)
    })
  }

  const createVerifyParser = () => {
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
    })
    .catch(function(err){
      console.log(err)
    })
  }

  return (
    <div className="App">
      <main>
      <Navbar userInfo = {userInfo}/>
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
        element = {<BasicInfo userInfo = {userInfo}></BasicInfo>}
        />
        <Route 
        path = "/user/basic/edit"
        element = {<BasicInfoEdit userInfo = {userInfo} saveBasicInfo={saveBasicInfo}></BasicInfoEdit>}
        />
        <Route 
        path = "/user/interests"
        element = {<Interests></Interests>}
        />
        <Route 
        path = "/user/media"
        element = {<Media></Media>}
        />
      </Routes>
      </main>
    </div>
  );
}
