import "./Navbar.css"

export default function Navbar({userInfo}) {
  return (
    <nav className="navbar">
      <div className="content">
        <p className="welcome-navbar">Welcome, {userInfo.preferredName}</p>
      </div>
    </nav>
  )
}