import * as React from "react"
import "./SignUp.css"
import Loading from "../Loading/Loading"

export default function SignUp({ onClickSignUp, onClickLogin, isFetching }) {
  return (
    <div className="signup" id="signup">
      {
        isFetching
          ?
          <Loading></Loading>
          :
          <div>
            <h1>Create Account</h1>
            <input id="email" className="input signup-input" type="email" placeholder="Enter your school email" required />
            <br />
            <input id="phoneNum" className="input signup-input" type="tel" placeholder="Enter your phone number" required />
            <br />
            <input id="password" className="input signup-input" type="password" placeholder="Create a Password" required />
            <br />
            <input id="confirm-password" className="input signup-input" type="password" placeholder="Confirm Password" required />
            <br />
            <input id="preferredName" className="input signup-input" type="text" placeholder="Preferred Name" required />
            <br />
            <button className="login-btn" onClick={onClickSignUp}>
              Next
            </button>
            <p>Already Have an Account? <b onClick={onClickLogin} className="signup-link">Log In</b></p>
          </div>
      }
    </div>
  )
}