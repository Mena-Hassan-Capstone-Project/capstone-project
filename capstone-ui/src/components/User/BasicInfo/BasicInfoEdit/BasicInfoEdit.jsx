import * as React from "react";
import "./BasicInfoEdit.css";
import ProfilePhoto from "../../ProfilePhoto/ProfilePhoto";
import Loading from "../../../Loading/Loading";
import Select from "react-select";

export default function BasicInfoEdit({
  userInfo,
  onClickInterests,
  onClickMedia,
  saveBasicInfo,
  setUserInfo,
  isFetching,
  selectedMajorOption,
  setSelectedMajorOption,
  majorList,
}) {
  return isFetching ? (
    <Loading></Loading>
  ) : (
    <div className="basicInfoEdit" id="basicInfoEdit">
      <div className="row">
        <div className="column">
          <ProfilePhoto
            imageList={
              userInfo.profile_photo
                ? [{ data_url: userInfo.profile_photo }]
                : []
            }
          ></ProfilePhoto>
          <h2 className="user-name">{userInfo.preferredName}</h2>
          <div className="user-info">
            <p className="menu-item active">Basic Info</p>
            <p onClick={onClickInterests} className="menu-item">
              Interests
            </p>
            <p onClick={onClickMedia} className="menu-item">
              Media
            </p>
          </div>
        </div>
        <div className="column col-2">
          <input
            className="input basic-input"
            id="year"
            type="text"
            placeholder="Graduation Year"
            defaultValue={userInfo.grad_year ? userInfo.grad_year : ""}
          />
          <br />
          {majorList ? (
            <div className="major-select">
              <p>Major:</p>
              <Select
                id="major-select"
                defaultValue={selectedMajorOption}
                onChange={setSelectedMajorOption}
                options={majorList.majors.map((major, index) => {
                  return { label: major.name, value: major };
                })}
              />
            </div>
          ) : null}
          <br />
          <input
            className="input basic-input"
            id="hometown"
            type="text"
            placeholder="Hometown"
            defaultValue={userInfo.hometown ? userInfo.hometown : ""}
          />
          <p className="user-info">
            <b>Tags: </b>
          </p>
          <div>
            <label className="add-tag">Add Tag: </label>
            <select name="tags" id="tags" className="tags-dropdown">
              <option value="None">None</option>
              <option value="Gapper">Gapper</option>
              <option value="FGLI">FGLI</option>
              <option value="Athlete">Athlete</option>
            </select>
          </div>
          <br />
          {userInfo.tags && userInfo.tags.length != 0
            ? userInfo.tags.map((tag, index) => (
                <div key={index} className="tag-item">
                  <p className="tag-text">{tag}</p>
                  <p
                    className="remove-tag"
                    onClick={() => {
                      var newTags = userInfo.tags;
                      newTags.splice(index, 1);
                      setUserInfo({ ...userInfo, tags: newTags });
                    }}
                  >
                    {" "}
                    x
                  </p>
                </div>
              ))
            : null}
          <br />
          <button className="login-btn" onClick={() => saveBasicInfo()}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
