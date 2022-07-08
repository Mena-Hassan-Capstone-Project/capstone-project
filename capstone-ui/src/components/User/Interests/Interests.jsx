import * as React from "react"
import "./Interests.css"


export default function Interests({userInfo, goToBasic, goToMedia}) {
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
          Interests
        </div>
        </div>
    </div> 
  )
}