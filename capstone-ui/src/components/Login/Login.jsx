import * as React from "react"
import "./Login.css"

export default function Login({createParser}) {
  return (
    <div className="login" id="login">
        <p>Login</p>
        <input id = "email" type="text" placeholder="email" />
        <input id = "password" type="text" placeholder="password" />
        <button onClick = {() => createParser()}>
            Log In
        </button>
    </div> 
  )
}