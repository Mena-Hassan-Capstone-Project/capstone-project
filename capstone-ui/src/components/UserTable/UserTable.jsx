import * as React from "react";
import axios from "axios";
import { useState } from "react";
import "./UserTable.css";

export default function UserTable() {
  const [userTable, setUserTable] = useState(null);

  const PORT = "3001";
  async function getUserTable() {
    await axios.get(`https://localhost:${PORT}/userTable`).then((resp) => {
      setUserTable(resp.data.entries);
    });
  }

  React.useEffect(() => {
    getUserTable();
  }, []);

  return (
    <div>
      <p className="user-table">User Table</p>
      {userTable ? <p>{`User Count : ${userTable.length}`}</p> : null}
      {userTable ? (
        <table>
          <thead>
            <tr>
              <th>objectId</th>
              <th>createdAt</th>
              <th>username</th>
              <th>firstName</th>
              <th>lastName</th>
              <th>preferredName</th>
              <th>university</th>
              <th>major</th>
              <th>grad_year</th>
              <th>hometown</th>
              <th>tags</th>
              <th>DOB</th>
              <th>phoneNum</th>
              <th>profile_photo</th>
              <th>media</th>
              <th>ig_access_token</th>
              <th>ig_username</th>
              <th>ig_media</th>
              <th>spotify_artists</th>
            </tr>
          </thead>
          <tbody>
            {userTable.map((item) => {
              return (
                <tr key={item.objectId}>
                  <td>{item.objectId}</td>
                  <td>{item.createdAt}</td>
                  <td>{item.username}</td>
                  <td>{item.firstName}</td>
                  <td>{item.lastName}</td>
                  <td>{item.preferredName}</td>
                  <td>{item.university}</td>
                  <td>{item.major?.name ? item.major.name : ""}</td>
                  <td>{item.grad_year}</td>
                  <td>{item.hometown}</td>
                  <td>{JSON.stringify(item.tags)}</td>
                  <td>{item.DOB}</td>
                  <td>{item.phoneNum}</td>
                  <td>{JSON.stringify(item.profile_photo) ? "Yes" : "No"}</td>
                  <td>{JSON.stringify(item.media) ? "Yes" : "No"}</td>
                  <td>{item.ig_access_token ? "Yes" : "No"}</td>
                  <td>{item.ig_username}</td>
                  <td>{JSON.stringify(item.ig_media) ? "Yes" : "No"}</td>
                  <td>{JSON.stringify(item.spotify_artists) ? "Yes" : "No"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : null}
    </div>
  );
}
