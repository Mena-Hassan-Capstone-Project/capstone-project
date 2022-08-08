import "./Navbar.css";

export default function Navbar({
  userInfo,
  onClickLogout,
  onClickMatching,
  goToBasic,
  goToLogin,
  onClickLiked,
}) {
  return (
    <nav className="navbar">
      <div className="content">
        <p
          className="welcome-navbar"
          onClick={userInfo?.preferredName ? goToBasic : goToLogin}
        >
          Welcome {userInfo?.preferredName ? userInfo.preferredName : ""}
        </p>
        {userInfo.preferredName ? (
          <p className="navbar-content" onClick={onClickMatching}>
            Get Matched!
          </p>
        ) : null}
        {userInfo.preferredName ? (
          <p className="navbar-content" onClick={onClickLiked}>
            See Liked
          </p>
        ) : null}
        <div className="stick-to-right">
          {userInfo ? (
            <button className="login-btn logout" onClick={onClickLogout}>
              Log Out
            </button>
          ) : null}
        </div>
      </div>
    </nav>
  );
}
