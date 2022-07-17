import * as React from "react"
import "./Interests.css"
import Loading from "../../Loading/Loading"


export default function Interests({userInfo, goToBasic, goToMedia, gotToEditInterests, isFetching}) {
  return (
    isFetching
    ? <Loading></Loading>
    :
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
            userInfo.interests && userInfo.interests.movies && userInfo.interests.movies != []  && Array.isArray(userInfo.interests.movies)?
            userInfo.interests.movies.map((movie, index) => (
              <div key={index} className="movie-item">
               <p className="movie-text">{movie.title}</p>
              </div>
            ))
            : null
          }
          <p className="interests-title">TV Shows:</p>
          {
            userInfo.interests && userInfo.interests.shows && userInfo.interests.shows != [] && Array.isArray(userInfo.interests.shows)?
            userInfo.interests.shows.map((show, index) => (
              <div key={index} className="movie-item">
               <p className="movie-text">{show.title}</p>
              </div>
            ))
            : null
          }
          <p className="interests-title">Music:</p>
          <p className="interests-title">Books:</p>
          <p className="interests-title">Hobbies:</p>
          {
            userInfo.interests && userInfo.interests.hobbies && userInfo.interests.hobbies != [] && Array.isArray(userInfo.interests.hobbies)?
            userInfo.interests.hobbies.map((hobby, index) => (
              <div key={index} className="movie-item">
               <p className="movie-text">{hobby.name}</p>
              </div>
            ))
            : null
          }
          <br />
          <button className = "login-btn" onClick = {gotToEditInterests}>
            Edit
        </button>
        </div>
        </div>
    </div> 
  )
}