import * as React from "react"
import "./Matching.css"
import Loading from "../Loading/Loading"
import { FaHeart } from "react-icons/fa";
import { FaRegHeart } from "react-icons/fa";
import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import { Carousel } from 'react-responsive-carousel'

export default function Matching({isFetching, userMatches, getMatchesForUser, matchOffset, setOffset, matchLimit, createMatches, goToMatching, setIsFetching={setIsFetching}}) {
  return (
    (isFetching || userMatches.length === 0 || !userMatches)
    ? <Loading></Loading>
    :
    <div className="matching" id="matching">
        {
            userMatches.map((match, index) => (
                <div key={index} className="card">
                    <p className="card-text">{match.userInfo.preferredName}</p>
                    <Carousel 
                    showArrows= {false}
                    showThumbs={false}>
                        <div>
                            <img key = {index} className = "media-carousel" src={match.userInfo.profile_photo} />
                        </div>
                        {
                            match.userInfo.media.map((photo, index) => (
                                <div>
                                    <img key = {index} className = "media-carousel" src={photo.data_url} />
                                </div>
                            ))
                        }
                    </Carousel>

                    <p className="card-text"><b>Match Score: {(match.scoreInfo.score * 100).toFixed(1)}%</b></p>
                    <p className="card-text">University: {match.userInfo.university}</p>
                    <p className="card-text">Graduation Year: {match.userInfo.grad_year}</p>
                    <p className="card-text">Major: {match.userInfo.major}</p>
                    <p className="card-text">Hometown: {match.userInfo.hometown}</p>
                    <p className="card-text">Tags: {match.userInfo.tags}</p>
                    <p className="card-text match-interests">Movies: </p>
                    {
                        match.interestsInfo.movies.map((movie, index) => (
                        <p className="card-text match-interests match-movies">{movie.title}</p>
                        ))
                    }
                    <p></p>
                    <p className="card-text match-interests">Shows: </p>
                    {
                        match.interestsInfo.shows.map((show, index) => (
                        <p className="card-text match-interests match-shows">{show.title}</p>
                        ))
                    }
                    <p></p>
                    <p className="card-text match-interests">Hobbies: </p>
                    {
                        match.interestsInfo.hobbies.map((hobby, index) => (
                        <p className="card-text match-interests match-hobbies">{hobby.name}</p>
                        ))
                    }
                    <br />
                    <button className = "login-btn" onClick = {async () => {
                        setIsFetching(true)
                        let liked = match.scoreInfo.liked
                        await createMatches({matchId: match.userInfo.objectId, liked: !liked})
                        await getMatchesForUser(10, 0)
                        await goToMatching()
                        setIsFetching(false)
                    }}>
                        {
                            match.scoreInfo.liked
                            ?
                            <FaHeart />
                            : <FaRegHeart />
                        }
                    </button>
                </div>
            ))
        }
        {
            userMatches.length < matchLimit
            ? null
            : <button className = "login-btn" onClick = {() =>{
                let newOffset = matchOffset + 10
                getMatchesForUser(10, newOffset)
                setOffset(newOffset)
                }}>
                See More
                </button>
        }
    </div>
  )
}