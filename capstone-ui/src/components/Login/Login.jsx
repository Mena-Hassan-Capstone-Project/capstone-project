import * as React from "react"
import "./Login.css"

export default function Login() {
  return (
    <div className="login" id="login">
        <p>Login</p>
        <input type="text" placeholder="email" />
        <input type="text" placeholder="password" />
    </div> 
  )
}