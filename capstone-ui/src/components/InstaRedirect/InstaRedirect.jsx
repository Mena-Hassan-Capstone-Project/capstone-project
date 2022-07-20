import * as React from "react"
import "./InstaRedirect.css"


export default function InstaRedirect() {
    const [counter, setCounter] = React.useState(5);

    React.useEffect(() => {
        counter > 0 && setTimeout(() => setCounter(counter - 1), 1000);
      }, [counter]);

    setTimeout(function() {
        window.location.replace('/login');
      }, 5000);
  return (
    <div >
       <p className="instagram-redirect">Instagram has been connected!</p>
       <p className="instagram-redirect">{`Redirecting to login in ${counter} seconds...`}</p>
    </div>
  )
}