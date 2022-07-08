import * as React from "react"
import "./BasicInfo.css"
import {useNavigate} from 'react-router-dom'

export default function BasicInfo({userInfo}) {
  const navigate = useNavigate();

  const goToInterests = () => {
    navigate('/user/interests')
  }

  const goToMedia = () => {
    navigate('/user/media')
  }

  const goToEditInfo = () => {
    navigate('/user/basic/edit')
  }

  return (
    <div className="basicInfo" id="basicInfo">
        <div className="row">
        <div className="column">
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
          </div>
          <button className = "login-btn" onClick = {goToEditInfo}>
            Edit
        </button>
        </div>
        </div>
    </div> 
  )
}