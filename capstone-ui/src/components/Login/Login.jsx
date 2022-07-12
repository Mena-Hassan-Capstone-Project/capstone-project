import * as React from "react"
import "./Login.css"
import Loading from "../Loading/Loading"

export default function Login({createLoginParser, isFetching, goToSignUp}) {
  return (
    isFetching
    ? <Loading></Loading>
    :
    <div className="login" id="login">
        <h1>Login</h1>
        <h2>Log in and start connecting!</h2>
        <input className = "input login-input" id = "email" type="email" placeholder="Email" />
        <br />
        <input className = "input login-input" id = "password" type="text" placeholder="Password" />
        <br />
        <button className = "login-btn" onClick = {() => createLoginParser()}>
            Log In
        </button>
        <p>Don't Have an Account Yet? <b onClick={goToSignUp} className="signup-link">Sign Up</b></p>
    </div> 
  )
}