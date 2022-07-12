import * as React from "react"
import "./InterestsEdit.css"
import { useState } from "react"


export default function InterestsEdit({userInfo, goToBasic, goToMedia, saveInterests, getSearch, movie, setUserInfo, removeMovie}) {
  const [movieClass, setMovieClass] = useState("hidden")

  function toggleMovieClass(){
    if(movieClass == "movie-input"){
      setMovieClass("hidden")
    }
    else{
      setMovieClass("movie-input")
    }
  }

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
            userInfo.interests && userInfo.interests.movies ?
            userInfo.interests.movies.map((movie, index) => (
              <div key={index} className="movie-item">
               <p className="movie-text">{movie.title}</p>
               <p className="movie-text remove-movie"
               onClick={
                () => {removeMovie(movie)}
                }
               > x</p>
              </div>
            ))
            : null
          }
        <br />
        {
          movieClass == "hidden"
          ? <div><button className = "add-interest-button" onClick={toggleMovieClass}>Add a movie</button></div>
          : <input id = "enter-movie" className = {movieClass} type="text" onChange={getSearch}/>
        }
        {
          movie && movie != ""
          ? 
          <div className="movie-item">
            <p className="movie-text">{movie.title}</p>
          </div>
          : null
        }
          <p className="interests-title">TV Shows:</p>
          <p className="interests-title">Music:</p>
          <p className="interests-title">Books:</p>
          <p className="interests-title">Hobbies:</p>
          <button className = "login-btn" onClick = {() => saveInterests()}>
            Save
          </button>
        </div>
        </div>
    </div> 
  )
}