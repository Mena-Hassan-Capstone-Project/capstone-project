import * as React from "react"
import { useState } from "react";
import "./Media.css"
import Loading from "../../Loading/Loading"


export default function Media({userInfo, goToBasic, goToInterests, goToEditMedia, isFetching, setupInsta, getInstaData}) {
  const [userData, setUserData] = useState("");
  return (
    isFetching
    ? <Loading></Loading>
    :
    <div className="media" id="media">
        <div className="row">
        <div className="column">
        <img src={userInfo.profile_photo} alt="" className="profile-img"/>
            <h2>{userInfo.preferredName}</h2>
            <div className="user-info">
              <p onClick = {goToBasic} className="menu-item">Basic Info</p>
              <p onClick = {goToInterests} className="menu-item">Interests</p>
              <p className="menu-item active">Media</p>
            </div>
        </div>
        <div className="column col-2" >
            {
              userInfo.media ?
            userInfo.media.map((pic, index) => (
              <div key={index} className="media-item">
               <img src={pic.data_url} alt="" className="media-img"/>
              </div>
            ))
            : null
            }     
      <button className = "login-btn" onClick = {goToEditMedia}>
            Edit
        </button>
        <br />
        {
          userInfo.ig_access_token
          ?
          <div className = "access-token">
          <p>{`Instagram Connected! Access Token: ${userInfo.ig_access_token}`}</p>
          <button onClick = {async () => {
            let data = await getInstaData(userInfo.ig_access_token)
            setUserData(data)
            console.log(data)
            }}>
            Get Instagram Data
          </button>
          </div>
          :
          <button onClick = {() => {setupInsta()}}>
            Connect to Instagram
          </button>
          }
          {
            userData.username ?
            <p>{`Username: ${userData.username}`}</p>
            :
            null
          }
        </div>
        </div>  
    </div> 
  )
}