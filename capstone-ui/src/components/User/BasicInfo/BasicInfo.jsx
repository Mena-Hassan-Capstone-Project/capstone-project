import * as React from "react"
import "./BasicInfo.css"
import Loading from "../../Loading/Loading"

export default function BasicInfo({userInfo, goToInterests, goToMedia, goToEditInfo, isFetching}) {

  return (
    isFetching
    ? <Loading></Loading>
    :
    <div className="basicInfo" id="basicInfo">
        <div className="row">
        <div className="column">
        <img src={userInfo.profile_photo} alt="" className="profile-img"/>
            <h2>{userInfo.preferredName}</h2>
            <div className="user-info">
              <p className="menu-item active">Basic Info</p>
              <p onClick = {goToInterests} className="menu-item">Interests</p>
              <p onClick = {goToMedia} className="menu-item">Media</p>
            </div>
        </div>
        <div className="column col-2" >
          <div className="user-info">
            <p><b>Graduation Year: </b>{userInfo.grad_year}</p>
            <p><b>Major: </b>{userInfo.major}</p>
            <p><b>Hometown: </b>{userInfo.hometown}</p>
            <p><b>Tags: </b></p>
            {
              userInfo?.tags ?
            userInfo.tags.map((tag, index) => (
              <div key={index} className="tag-item">
               <p className="tag-text">{tag}</p>
              </div>
            ))
            : null
            }
          </div>
          <button className = "login-btn" onClick = {goToEditInfo}>
            Edit
        </button>
        </div>
        </div>
    </div> 
  )
}