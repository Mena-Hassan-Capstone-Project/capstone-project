import * as React from "react"
import "./Interests.css"


export default function Interests({userInfo, goToBasic, goToMedia, gotToEditInterests}) {
  return (
    <div className="interests" id="interests">
        <div className="row">
        <div className="column">
        <img src={userInfo.profile_photo} alt="" className="profile-img"/>
            <h2>{userInfo.preferredName}</h2>
            <div className="user-info">
              <p onClick = {goToBasic} className="menu-item">Basic Info</p>
              <p className="menu-item active">Interests</p>
              <p onClick = {goToMedia} className="menu-item">Media</p>
            </div>
        </div>
        <div className="column col-2" >
          <p className="interests-title">Movies:</p>
          {
            userInfo.interests && userInfo.interests.movies && userInfo.interests.movies != [] ?
            userInfo.interests.movies.map((movie, index) => (
              <div key={index} className="movie-item">
               <p className="movie-text">{movie.title}</p>
              </div>
            ))
            : null
          }
          <p className="interests-title">TV Shows:</p>
          <p className="interests-title">Music:</p>
          <p className="interests-title">Books:</p>
          <p className="interests-title">Hobbies:</p>
          <button className = "login-btn" onClick = {gotToEditInterests}>
            Edit
        </button>
        </div>
        </div>
    </div> 
  )
}