import * as React from "react"
import { useState } from "react";
import "./Media.css"
import Loading from "../../Loading/Loading"


export default function Media({ userInfo, onClickBasic, onClickInterests, onClickEditMedia, isFetching, onClickInsta, getInstaPhotos, uploadInstaPhotos }) {
  const [userData, setUserData] = useState([]);
  return (
    isFetching
      ? <Loading></Loading>
      :
      <div className="media" id="media">
        <div className="row">
          <div className="column">
            <img src={userInfo.profile_photo} alt="" className="profile-img" />
            <h2>{userInfo.preferredName}</h2>
            <div className="user-info">
              <p onClick={onClickBasic} className="menu-item">Basic Info</p>
              <p onClick={onClickInterests} className="menu-item">Interests</p>
              <p className="menu-item active">Media</p>
            </div>
          </div>
          <div className="column col-2" >
            {
              userInfo.media ?
                userInfo.media.map((pic, index) => (
                  <div key={index} className="media-item">
                    <img src={pic.data_url} alt="" className="media-img" />
                  </div>
                ))
                : null
            }
            <button className="login-btn" onClick={onClickEditMedia}>
              Edit
            </button>
            <br />
            {
              userInfo.ig_access_token
                ?
                userInfo.ig_media
                  ?
                  <p>Instagram photos added to media!</p>
                  :
                  <div className="access-token">
                    <p>{`Instagram Connected!`}</p>
                    <button className="insta-btn" onClick={async () => {
                      const data = await getInstaPhotos(userInfo.ig_access_token);
                      setUserData(data)
                      if (!userInfo.ig_media) {
                        uploadInstaPhotos(data)
                      }
                    }}>
                      Add Instagram Photos to Profile
                    </button>
                  </div>
                :
                <button className="insta-btn" onClick={onClickInsta}>
                  Connect to Instagram
                </button>
            }
            {
              userInfo.ig_media
                ?
                <div>
                  {userInfo.ig_media.map((pic, index) => (
                    <div key={index} className="media-item">
                      <img src={pic} alt="" className="media-img" />
                    </div>
                  ))}
                </div>
                : null
            }
            {
              userData && Array.isArray(userData) ?
                userData.map((pic, index) => (
                  <div key={index} className="media-item">
                    <img src={pic} className="media-img" />
                  </div>
                ))
                : null
            }
          </div>
        </div>
      </div>
  )
}