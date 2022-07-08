import * as React from "react"
import "./BasicInfoEdit.css"
import ProfilePhoto from "../../ProfilePhoto/ProfilePhoto"


export default function BasicInfoEdit({userInfo, saveBasicInfo}) {

  return (
    <div className="basicInfoEdit" id="basicInfoEdit">
        <div className="row">
        <div className="column">
        <ProfilePhoto></ProfilePhoto>
            <h2>{userInfo.preferredName}</h2>
            <div className="user-info">
              <p className="menu-item active">Basic Info</p>
              <p className="menu-item">Interests</p>
              <p className="menu-item">Media</p>
            </div>
        </div>
        <div className="column" >
            <input className = "input basic-input" id = "year" type="text" placeholder="Graduation Year" />
            <br />
            <input className = "input basic-input" id = "major" type="text" placeholder="Major" />
            <br />
            <input className = "input basic-input" id = "hometown" type="text" placeholder="Hometown" />
            <p className="user-info"><b>Tags: </b></p>
            <br />
            <button className = "login-btn" onClick = {() => saveBasicInfo()}>
            Save
          </button>
        </div>
        </div>
    </div> 
  )
}