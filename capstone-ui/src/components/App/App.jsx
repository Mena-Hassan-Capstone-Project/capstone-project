import * as React from "react"
import {BrowserRouter, Route, Routes} from 'react-router-dom'
import './App.css';
import axios from "axios"
import Login from '../Login/Login'

export default function App() {
  const PORT = '3001'
  const createParser = () => {
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

  return (
    <div className="App">
      <BrowserRouter>
      <main>
      <Routes>
        <Route 
        path = "/login"
        element = {<Login createParser = {createParser}></Login>}
        />
      </Routes>
      </main>
      </BrowserRouter>
    </div>
  );
}
