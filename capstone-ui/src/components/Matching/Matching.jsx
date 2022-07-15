import * as React from "react"
import "./Matching.css"
import Loading from "../Loading/Loading"
import { useState, useEffect } from "react";

export default function Matching({isFetching, userMatches, getMatchesForUser, matchOffset, setOffset, matchLimit}) {

  return (
    isFetching
    ? <Loading></Loading>
    :
    userMatches[0]
    ?
    <div className="matching" id="matching">
        {
            userMatches.map((match, index) => (
                <div key={index} className="card">
                        <p className="card-text">{match.userInfo.preferredName}</p>
                        <img src={match.userInfo.profile_photo} alt="" className="profile-img"/>
                        <p className="card-text">Match Score: {match.scoreInfo.score.toFixed(2) * 100}%</p>
                        <p className="card-text">University: {match.userInfo.university}</p>
                        <p className="card-text">Graduation Year: {match.userInfo.grad_year}</p>
                        <p className="card-text">Major: {match.userInfo.major}</p>
                        <p className="card-text">Hometown: {match.userInfo.hometown}</p>
                        <p className="card-text">Tags: {match.userInfo.tags}</p>
                </div>
            ))
        }
        {
            userMatches.length < matchLimit
            ? null
            : <button className = "login-btn" onClick = {() =>{
                let newOffset = matchOffset + 10
                getMatchesForUser(10, newOffset)
                setOffset(newOffset)
                }}>
                See More
                </button>
        }
    </div> 
    :
    <p>No matches yet!</p>
  )
}