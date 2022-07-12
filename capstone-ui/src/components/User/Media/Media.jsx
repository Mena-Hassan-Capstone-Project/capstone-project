import * as React from "react"
import "./Media.css"
import Loading from "../../Loading/Loading"


export default function Media({userInfo, goToBasic, goToInterests, goToEditMedia, isFetching}) {
  console.log("userInfo media: ", userInfo.media)
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
        </div>
        </div>  
    </div> 
  )
}