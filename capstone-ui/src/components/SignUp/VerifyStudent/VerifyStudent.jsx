import * as React from "react"
import "./VerifyStudent.css"


export default function VerifyStudent({createVerifyParser}) {
  return (
    <div className="verify" id="verify">
        <h1>Confirm You're a Student</h1>
        <input className = "input signup-input" id = "firstName" type="text" placeholder="First Name" />
        <br />
        <input className = "input signup-input" id = "lastName" type="text" placeholder="Last Name" />
        <br />
        <input className = "input signup-input" id = "university" type="text" placeholder="University" />
        <br />
        <div>
        <input className = "input signup-input" id = "DOB" type = "date" />
        </div>
        <br />
        <button className = "login-btn" onClick = {() => createVerifyParser()}>
            Next
        </button>    
    </div> 
  )
}