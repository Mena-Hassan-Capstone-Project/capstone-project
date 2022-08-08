import * as React from "react"
import "./Liked.css"
import Loading from "../Loading/Loading"
import { FaHeart } from "react-icons/fa";
import { FaRegHeart } from "react-icons/fa";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from 'react-responsive-carousel'
import { useState } from "react";

export default function Liked({ isFetching, userMatches, getMatchesForUser, createMatches, goToLiked, setIsFetching, goToSuggest, setSuggestMatch }) {
    const [numLikes, setNumLiked] = useState(0);

    //add max 10 photos to match's media carousel
    const MAX_MEDIA = 10;

    const getMediaArray = (media, igMedia) => {
        let mediaArray = [];
        let count = 0;
        if (media) {
            for (let i = 0; i < media.length && count < MAX_MEDIA; i++) {
                mediaArray.push(media[i].data_url);
                count++;
            }
        }
        if (igMedia) {
            for (let i = 0; i < igMedia.length && count < MAX_MEDIA; i++) {
                mediaArray.push(igMedia[i]);
                count++;
            }
        }
        return mediaArray;
    }

    const formatPhoneNumber = (phoneNumberString) => {
        let cleaned = ('' + phoneNumberString).replace(/\D/g, '');
        let match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
        if (match) {
            return '(' + match[1] + ') ' + match[2] + '-' + match[3];
        }
        return null;
    }

    const countLikes = () => {
        const numLiked = document.getElementsByClassName("card");
        setNumLiked(numLiked);
    }

    React.useEffect(() => {
        countLikes();
    }, []);


    return (
        (isFetching || !userMatches || !Array.isArray(userMatches))
            ? <Loading />
            :
            userMatches.length == 0
                ? <Loading loadingText={"Retrieving"} />
                :
                <div>
                    <div className="card-grid" id="matching">
                        {
                            userMatches.map((match, index) => (
                                match.scoreInfo.liked
                                    ?
                                    <div key={index} className="card">
                                        <p className="card-text">{match.userInfo.preferredName}</p>
                                        {
                                            match.userInfo.profile_photo
                                                ?
                                                <Carousel
                                                    className="carousel"
                                                    statusFormatter={function () { }}
                                                    dynamicHeight={true}
                                                    showArrows={false}
                                                    showThumbs={false}>
                                                    <div>
                                                        <img key={index} className="media-carousel" src={match.userInfo.profile_photo} />
                                                    </div>
                                                    {
                                                        match.userInfo.ig_media ?
                                                            getMediaArray(match.userInfo.media, match.userInfo.ig_media).map((photo, index) => (
                                                                <div>
                                                                    <img key={index} className="media-carousel" src={photo} />
                                                                </div>
                                                            ))
                                                            :
                                                            getMediaArray(match.userInfo.media, []).map((photo, index) => (
                                                                <div>
                                                                    <img key={index} className="media-carousel" src={photo} />
                                                                </div>
                                                            ))
                                                    }
                                                </Carousel>
                                                : null
                                        }

                                        <p className="card-text"><b>Match Score: {(match.scoreInfo.score * 100).toFixed(1)}%</b></p>
                                        <p className="card-text">University: {match.userInfo.university}</p>
                                        <p className="card-text">Graduation Year: {match.userInfo.grad_year}</p>
                                        <p className="card-text">Major: {match.userInfo.major?.name}</p>
                                        <p className="card-text">Hometown: {match.userInfo.hometown}</p>
                                        <p className="card-text">{match.userInfo.tags.length > 0 ? `Tags: ${match.userInfo.tags}` : ""}</p>
                                        {
                                            Array.isArray(match.interestsInfo.movies) && match.interestsInfo.movies.length > 0
                                                ?
                                                <div>
                                                    <p className="card-text match-interests">Movies: </p>
                                                    {match.interestsInfo.movies.map((movie, index) => (

                                                        <p key={index} className="card-text match-interests match-movies">{movie.title}</p>
                                                    ))}
                                                </div>
                                                :
                                                null
                                        }
                                        <p></p>
                                        {
                                            Array.isArray(match.interestsInfo.shows) && match.interestsInfo.shows.length > 0
                                                ?
                                                <div>
                                                    <p className="card-text match-interests">Shows: </p>
                                                    {match.interestsInfo.shows.map((show, index) => (
                                                        <p key={index} className="card-text match-interests match-shows">{show.title}</p>

                                                    ))}
                                                </div>
                                                : null
                                        }
                                        <p></p>
                                        {
                                            match.userInfo.spotify_artists
                                                ?
                                                <div>
                                                    <p className="card-text match-interests">Top Spotify Artists: </p>
                                                    {match.userInfo.spotify_artists.map((artist, index) => (
                                                        <div key={index}>
                                                            <p>{`${index + 1}. ${artist.name}`}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                                : null
                                        }
                                        <p></p>
                                        {
                                            Array.isArray(match.interestsInfo.hobbies) && match.interestsInfo.hobbies.length > 0
                                                ?
                                                <div>
                                                    <p className="card-text match-interests">Hobbies: </p>
                                                    {match.interestsInfo.hobbies.map((hobby, index) => (
                                                        <p key={index} className="card-text match-interests match-hobbies">{hobby.name}</p>
                                                    ))}
                                                </div>
                                                :
                                                null
                                        }
                                        {
                                            match.scoreInfo.display_private
                                                ?
                                                <div>
                                                    <p><b>{`${match.userInfo.preferredName} liked you! Contact ${match.userInfo.preferredName}:`}</b></p>
                                                    <p>{`Phone number: ${formatPhoneNumber(match.userInfo.phoneNum)}`}</p>
                                                    {match.userInfo.ig_username ? <a className="p-link" href={`https://www.instagram.com/${match.userInfo.ig_username}`} target="_blank">{`Instagram Username : ${match.userInfo.ig_username}`}</a> : null}
                                                </div>
                                                :
                                                null
                                        }
                                        {<button className="login-btn" onClick={async () => {
                                            setIsFetching(true);
                                            const liked = match.scoreInfo.liked;
                                            await createMatches({ matchId: match.userInfo.objectId, liked: !liked });
                                            await getMatchesForUser(100, 0);
                                            await goToLiked();
                                            setIsFetching(false);
                                        }}>
                                            {
                                                match.scoreInfo.liked
                                                    ?
                                                    <FaHeart />
                                                    : <FaRegHeart />
                                            }
                                        </button>}
                                        <br />
                                        <button className="suggest-btn" onClick={() => {
                                            setSuggestMatch(match);
                                            goToSuggest();
                                        }}>Get Suggestions</button>
                                    </div>
                                    : null
                            ))
                        }
                        {
                            numLikes.length == 0
                                ? <h2>No Liked Matches Yet!</h2>
                                : null
                        }
                    </div>
                </div>
    )
}