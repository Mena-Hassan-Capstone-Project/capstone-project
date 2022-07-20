import * as React from "react"
import "./SignUp.css"
import Loading from "../Loading/Loading"

export default function SignUp({createSignUpParser, goToLogin, isFetching}) {
  return (
      <div className="signup" id="signup">
        {
      isFetching
      ?
      <Loading></Loading>
      :
      <div>
        <h1>Create Account</h1>
        <input id = "email" className = "input signup-input" type="email" placeholder="Enter your school email" />
        <br />
        <input id = "password" className = "input signup-input" type="password" placeholder="Create a Password" />
        <br />
        <input id = "confirm-password" className = "input signup-input" type="password" placeholder="Confirm Password" />
        <br />
        <input id = "preferredName" className = "input signup-input" type="text" placeholder="Preferred Name" />
        <br />
        <button className = "login-btn" onClick = {() => createSignUpParser()}>
            Next
        </button>
        <p>Already Have an Account? <b onClick={goToLogin} className="signup-link">Log In</b></p>
        </div>
        }
    </div>
  )
}