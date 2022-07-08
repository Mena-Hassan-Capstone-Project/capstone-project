import "./Navbar.css"

export default function Navbar({userInfo, logOut}) {
  return (
    <nav className="navbar">
      <div className="content">
        <p className="welcome-navbar">Welcome {userInfo.preferredName
        ? userInfo.preferredName
        : ""}
        </p>
        <div className="stick-to-right">
        <button className = "login-btn" onClick = {logOut}>
            Log Out
          </button>
        </div>
      </div>
    </nav>
  )
}