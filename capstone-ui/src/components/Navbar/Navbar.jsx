import "./Navbar.css"

export default function Navbar({userInfo, logOut, goToMatching, goToBasic}) {
  return (
    <nav className="navbar">
      <div className="content">
        <p className="welcome-navbar" onClick = {goToBasic}>Welcome {userInfo.preferredName
        ? userInfo.preferredName
        : ""}
        </p>
        <p className ="navbar-content" onClick={goToMatching}>Get Matched!</p>
        <div className="stick-to-right">
        <button className = "login-btn" onClick = {logOut}>
            Log Out
          </button>
        </div>
      </div>
    </nav>
  )
}