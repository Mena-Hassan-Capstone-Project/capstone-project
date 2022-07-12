import * as React from "react"
import "./BasicInfoEdit.css"
import ProfilePhoto from "../../ProfilePhoto/ProfilePhoto"
import Loading from "../../../Loading/Loading"


export default function BasicInfoEdit({userInfo, saveBasicInfo, setUserInfo, isFetching}) {
  console.log(userInfo.tags)

  return (
    isFetching
    ? <Loading></Loading>
    :
    <div className="basicInfoEdit" id="basicInfoEdit">
        <div className="row">
        <div className="column">
        <ProfilePhoto imageList={[{"data_url" : userInfo.profile_photo}]} maxImages={1}></ProfilePhoto>
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
            <div>
              <label className = "add-tag">Add Tag: </label>
              <select name="tags" id="tags" className="tags-dropdown">
                <option value="Gapper">Gapper</option>
                <option value="FGLI">FGLI</option>
                <option value="Athlete">Athlete</option>
              </select>
            </div>
            <br />
            {
              userInfo.tags && userInfo.tags.length != 0 ?
              userInfo.tags.map((tag, index) => (
              <div key={index} className="tag-item">
               <p className="tag-text">{tag}</p>
               <p className="remove-tag" onClick={
                () => {
                  console.log("tags", userInfo.tags)
                  var newTags = userInfo.tags
                  newTags.splice(index, 1)
                  console.log(newTags)
                  setUserInfo({...userInfo, tags:newTags})
                }
                }> x</p>
              </div>
            ))
            : null
            }
            <br />
            <button className = "login-btn" onClick = {() => saveBasicInfo()}>
            Save
          </button>
        </div>
        </div>
    </div> 
  )
}