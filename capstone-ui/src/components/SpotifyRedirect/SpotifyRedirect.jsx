import * as React from "react";
import "./SpotifyRedirect.css";

export default function SpotifyRedirect({ goToBasic, refreshLogin }) {
  const [counter, setCounter] = React.useState(5);
  const [timeoutCount, setTimeoutCount] = React.useState(0);

  React.useEffect(() => {
    counter > 0 && setTimeout(() => setCounter(counter - 1), 1000);
  }, [counter]);

  setTimeout(function () {
    if (timeoutCount === 0) {
      setTimeoutCount(1);
      goToBasic();
      setTimeout(refreshLogin, 500);
    }
  }, 5000);

  return (
    <div>
      <p className="instagram-redirect">Spotify Connected!</p>
      <p className="instagram-redirect">{`Redirecting to user profile in ${counter} seconds...`}</p>
    </div>
  );
}
