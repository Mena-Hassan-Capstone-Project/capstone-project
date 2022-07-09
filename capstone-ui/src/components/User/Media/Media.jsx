import * as React from "react"
import "./Media.css"


export default function Media({userInfo, goToBasic, goToInterests, goToEditMedia}) {
  console.log("userInfo media: ", userInfo.media)
  return (
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
            {userInfo.media.map((pic, index) => (
              <div key={index} className="media-item">
               <img src={pic.data_url} alt="" className="media-img"/>
              </div>
            ))}     
      <button className = "login-btn" onClick = {goToEditMedia}>
            Edit
        </button>
        </div>
        </div>  
    </div> 
  )
}