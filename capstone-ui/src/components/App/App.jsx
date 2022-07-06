import * as React from "react"
import {Route, Routes, useNavigate} from 'react-router-dom'
import './App.css';
import axios from "axios"
import Login from '../Login/Login'
import SignUp from '../SignUp/SignUp'
import VerifyStudent from "../SignUp/VerifyStudent/VerifyStudent";
import Navbar from "../Navbar/Navbar";

export default function App() {
  const navigate = useNavigate();

  const PORT = '3001'

  const createLoginParser = () => {
    axios.post(`http://localhost:${PORT}/login`, {
      email: document.getElementById('email').value,
      password: document.getElementById('password').value
    })
    .then(function(response){
      console.log(response)
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
      console.log(response)
      navigate('/verify')
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
      console.log(response)
    })
    .catch(function(err){
      console.log(err)
    })
  }

  return (
    <div className="App">
      <main>
      <Navbar />
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
      </Routes>
      </main>
    </div>
  );
}
