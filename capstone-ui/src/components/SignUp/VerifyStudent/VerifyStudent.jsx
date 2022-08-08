import * as React from "react";
import "./VerifyStudent.css";
import Select from "react-select";

export default function VerifyStudent({
  onClickVerify,
  collegeList,
  selectedCollegeOption,
  setSelectedCollegeOption,
}) {
  return (
    <div className="verify" id="verify">
      <h1>Confirm You're a Student</h1>
      <input
        className="input signup-input"
        id="firstName"
        type="text"
        placeholder="First Name"
        required
      />
      <br />
      <input
        className="input signup-input"
        id="lastName"
        type="text"
        placeholder="Last Name"
        required
      />
      <br />
      {collegeList ? (
        <div>
          <p className="verify-title">Select University:</p>
          <Select
            id="university-select"
            className="verify-search-select"
            defaultValue={selectedCollegeOption}
            onChange={setSelectedCollegeOption}
            options={collegeList.map((college, index) => {
              return { label: college.institution, value: index };
            })}
          />
        </div>
      ) : null}
      <br />
      <div>
        <p className="verify-title">Date of Birth:</p>
        <input
          className="input signup-input"
          placeholder="DOB"
          id="DOB"
          type="date"
          required
        />
      </div>
      <br />
      <button className="login-btn" onClick={onClickVerify}>
        Next
      </button>
    </div>
  );
}
