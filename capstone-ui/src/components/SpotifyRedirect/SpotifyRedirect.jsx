import * as React from "react"
import "./SpotifyRedirect.css"


export default function SpotifyRedirect({goToLogin}) {
  const [counter, setCounter] = React.useState(5);

  React.useEffect(() => {
    counter > 0 && setTimeout(() => setCounter(counter - 1), 1000);
  }, [counter]);

  setTimeout(function () {
    goToLogin()
  }, 5000);

  return (
    <div >
      <p className="instagram-redirect">Spotify Connected!</p>
      <p className="instagram-redirect">{`Redirecting to login in ${counter} seconds...`}</p>
    </div>
  )
}