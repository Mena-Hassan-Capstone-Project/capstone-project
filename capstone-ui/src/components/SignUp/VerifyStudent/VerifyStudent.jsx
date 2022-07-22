import * as React from "react"
import "./VerifyStudent.css"


export default function VerifyStudent({ onClickVerify }) {
  return (
    <div className="verify" id="verify">
      <h1>Confirm You're a Student</h1>
      <input className="input signup-input" id="firstName" type="text" placeholder="First Name" required/>
      <br />
      <input className="input signup-input" id="lastName" type="text" placeholder="Last Name" required/>
      <br />
      <input className="input signup-input" id="university" type="text" placeholder="University" required/>
      <br />
      <div>
        <input className="input signup-input" placeholder = "DOB" id="DOB" type="date" required/>
      </div>
      <br />
      <button className="login-btn" onClick={onClickVerify}>
        Next
      </button>
    </div>
  )
}