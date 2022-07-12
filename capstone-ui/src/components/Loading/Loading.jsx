import * as React from "react"
import "./Loading.css"
import ReactLoading from 'react-loading';


export default function Loading() {
  return (
    <div >
        <ReactLoading className = "loading" type="bars" color="#BE6A6A" height={'30%'} width={'30%'} />
        <p className="loading-text">Loading</p>
    </div>
  )
}