import * as React from "react";
import "./ProfilePhoto.css";
import ImageUploading from "react-images-uploading";
import axios from "axios";

export default function ProfilePhoto({ imageList }) {
  const [images, setImages] = React.useState(imageList);
  const maxNumber = 1;

  const onChange = (imageList, addUpdateIndex) => {
    // data for submit
    setImages(imageList);
  };

  const PORT = "3001";

  const saveProfilePic = () => {
    var profile_img = images[0];
    console.log("profile img", profile_img)
    axios
      .post(`https://localhost:${PORT}/user/basic`, {
        profile_photo: profile_img.data_url,
      })
      .then(function (response) {
        console.log("Profile Response:", response);
      })
      .catch(function (err) {
        console.log(err);
      });
  };
  return (
    <div className="profilePhoto" id="profilePhoto">
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
            {imageList.map((image, index) => (
              <div key={index} className="image-item">
                <img
                  id="profile-img"
                  src={image["data_url"]}
                  alt=""
                  className="profile-img"
                />
                <div className="image-item__btn-wrapper">
                  <button
                    className="img-btn"
                    onClick={() => onImageUpdate(index)}
                  >
                    Update
                  </button>
                  <button
                    className="img-btn"
                    onClick={() => onImageRemove(index)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
            &nbsp;
            {images.length === 0 ? (
              <button
                className="img-btn"
                onClick={() => {
                  onImageUpload();
                }}
                {...dragProps}
              >
                Upload
              </button>
            ) : document.getElementById("profile-img") == null ? (
              console.log("loading")
            ) : (
              saveProfilePic()
            )}
          </div>
        )}
      </ImageUploading>
    </div>
  );
}
