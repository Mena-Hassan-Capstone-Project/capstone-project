import * as React from "react"
import "./Matching.css"
import Loading from "../Loading/Loading"

export default function Matching({isFetching}) {
  return (
    isFetching
    ? <Loading></Loading>
    :
    <div className="matching" id="matching">
        <p>hello</p>
    </div> 
  )
}