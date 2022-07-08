import * as React from "react"
import "./Media.css"
import ProfilePhoto from "../ProfilePhoto/ProfilePhoto"


export default function Media({userInfo, goToBasic, goToInterests}) {
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
          Media
        </div>
        </div>
    </div> 
  )
}