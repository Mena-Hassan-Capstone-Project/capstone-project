import "./Navbar.css"

export default function Navbar({ userInfo, onClickLogout, onClickMatching, goToBasic, goToLogin }) {
  return (
    <nav className="navbar">
      <div className="content">
        <p className="welcome-navbar" onClick={userInfo?.preferredName ? goToBasic : goToLogin}>Welcome {userInfo?.preferredName
          ? userInfo.preferredName
          : ""}
        </p>
       {userInfo.preferredName ? <p className="navbar-content" onClick={onClickMatching}>Get Matched!</p> : null}
        <div className="stick-to-right">
          {
            userInfo
              ?
              <button className="login-btn" onClick={onClickLogout}>
                Log Out
              </button>
              :
              null
          }
        </div>
      </div>
    </nav>
  )
}
