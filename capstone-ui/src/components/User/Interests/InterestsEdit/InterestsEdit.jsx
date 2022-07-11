import * as React from "react"
import "./InterestsEdit.css"
import { useState } from "react"


export default function InterestsEdit({userInfo, goToBasic, goToMedia, saveInterests, getSearch, movie}) {
  const [movieClass, setMovieClass] = useState("hidden")

  function toggleMovieClass(){
    if(movieClass == ""){
      setMovieClass("hidden")
    }
    else{
      setMovieClass("")
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
          {/*<div className="select-container">
          {movies && <Select id = "movie-select" className = "search-select" options={movie_options} />}
  </div>*/}
        <button onClick={toggleMovieClass}>Add a movie</button>
        <br />
        <input id = "enter-movie" className = {movieClass} type="text" onChange={getSearch}/>
        {/*
          userInfo.interests && userInfo.interests.movies
          ? <p>{userInfo.interests.movies.title}</p>
          : null
        */}
        {
          movie && movie != ""
          ? <p>{movie.title}</p>
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