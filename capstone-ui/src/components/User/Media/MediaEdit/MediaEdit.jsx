import * as React from "react"
import "./MediaEdit.css"
import ImageUploading from 'react-images-uploading';
import axios from "axios"
import { useNavigate } from 'react-router-dom'
import Loading from "../../../Loading/Loading";

export default function MediaEdit({ userInfo, onClickBasic, onClickInterests, imageList, maxImages, setUserInfo, isFetching, setIsFetching }) {

  const navigate = useNavigate();

  const [images, setImages] = React.useState(imageList);
  const maxNumber = maxImages;

  const onChange = (imageList, addUpdateIndex) => {
    setImages(imageList);
  };

  const PORT = '3001'

  const onClickSaveMedia = () => {
    setIsFetching(true)
    axios.post(`https://localhost:${PORT}/user/basic`, {
      media: images,
    })
      .then(function (response) {
        setUserInfo({ ...userInfo, media: images })
        navigate('/user/media')
        setIsFetching(false)
      })
      .catch(function (err) {
        console.log(err)
      })
  }

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
            <ImageUploading
              multiple
              value={images}
              onChange={onChange}
              maxNumber={maxNumber}
              dataURLKey="data_url"
            >
              {({
                imageList,
                onImageUpload,
                onImageRemoveAll,
                onImageUpdate,
                onImageRemove,
                isDragging,
                dragProps,
              }) => (
                // write your building UI
                <div className="upload__image-wrapper">
                  <button
                    className="media-btn"
                    style={isDragging ? { color: 'red' } : undefined}
                    onClick={onImageUpload}
                    {...dragProps}
                  >
                    Upload
                  </button>
                  <button className="media-btn" onClick={() => {
                    onImageRemoveAll();
                    setImages([])
                  }}>Remove All</button>
                  {imageList.map((image, index) => (
                    <div key={index} className="image-item">
                      <img src={image['data_url']} alt="" width="100" className="media-img" />
                      <div className="image-item__btn-wrapper">
                        <button className="media-btn" onClick={() => onImageUpdate(index)}>Update</button>
                        <button className="media-btn" onClick={() => {
                          onImageRemove(index)
                        }}>Remove</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ImageUploading>
            <button className="login-btn" onClick={onClickSaveMedia}>
              Save
            </button>
          </div>
        </div>
      </div>
  )
}