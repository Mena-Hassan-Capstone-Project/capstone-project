import "./Navbar.css"

export default function Navbar({userInfo, logOut, goToMatching, goToBasic, goToLogin}) {
  return (
    <nav className="navbar">
      <div className="content">
        <p className="welcome-navbar" onClick = {userInfo?.preferredName ? goToBasic : goToLogin}>Welcome {userInfo?.preferredName
        ? userInfo.preferredName
        : ""}
        </p>
        <p className ="navbar-content" onClick={goToMatching}>Get Matched!</p>
        <div className="stick-to-right">
        {
          userInfo
          ?
          <button className = "login-btn" onClick = {logOut}>
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
