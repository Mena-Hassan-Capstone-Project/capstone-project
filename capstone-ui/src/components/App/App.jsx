import * as React from "react"
import {BrowserRouter, Route, Routes} from 'react-router-dom'
import './App.css';
import Login from '../Login/Login'

export default function App() {
  return (
    <div className="App">
        
      <BrowserRouter>
      <main>
      <Routes>
        <Route 
        path = "/login"
        element = {<Login></Login>}
        />
      </Routes>
      </main>
      </BrowserRouter>
    </div>
  );
}
