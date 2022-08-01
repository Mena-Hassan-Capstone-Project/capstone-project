import * as React from "react"
import "./Suggestions.css"
import { useState } from "react";

export default function Suggestions({ suggestMatch, userInfo }) {
    const TICKETMASTER_API_KEY = "NFYrlQO2ef4cUcAYyvNKkGhdEZbx7oJp";
    const DISCOVER_URL = "https://app.ticketmaster.com/discovery/v2/events.json?latlong=";
    const [suggestions, setSuggestions] = useState(null);
    const [latLong, setLatLong] = useState(null);
    const NUM_SUGGESTIONS = 10;

    //get user's current location
    React.useEffect(() => {
        if (window.navigator.geolocation) {
            window.navigator.geolocation.getCurrentPosition(successfulLookup, console.log);
        }
    }, []);

    //get suggestions once we have user location
    React.useEffect(() => {
        if (!suggestions || suggestions.length == 0) {
            getResults(latLong);
        }
    }, [latLong]);

    //get user's current location
    const successfulLookup = async position => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        setLatLong({ lat: latitude, long: longitude });
    }

    //get suggestions for activities to do together
    async function getResults(latLong) {
        let matchSuggestions = [];
        //suggest based on music
        if (userInfo?.spotify_artists && suggestMatch?.spotify_artists) {
            for (let i = 0; i < suggestMatch.spotify_artists.length; i++) {
                let artist = suggestMatch.spotify_artists[i];
                let contains = await userInfo.spotify_artists.some(elem => {
                    return JSON.stringify(artist) === JSON.stringify(elem);
                });
                //if they have an artist in common
                if (contains) {
                    await fetch(DISCOVER_URL + `${latLong.lat},${latLong.long}&size=2&keyword=${artist.name}&apikey=` + TICKETMASTER_API_KEY)
                        .then(async (response) => {
                            const result = await response.json();
                            if (result._embedded?.events) {
                                matchSuggestions = matchSuggestions.concat(result._embedded.events);
                                setSuggestions(matchSuggestions);
                            }
                        }).catch((error) => {
                            // Your error is here!
                            console.log(error);
                        });
                }
            }
        }
        if (matchSuggestions.length == 0) {
            let response = await fetch(DISCOVER_URL + `${latLong.lat},${latLong.long}&size=${NUM_SUGGESTIONS}&keyword=${userInfo?.university}&apikey=` + TICKETMASTER_API_KEY)
                .then(async (response) => {
                    const result = await response.json();
                    if (result._embedded?.events) {
                        matchSuggestions = matchSuggestions.concat(result._embedded.events);
                        setSuggestions(matchSuggestions);
                    }
                }).catch((error) => {
                    // Your error is here!
                    console.log(error);
                });
        }
    }

    return (
        <div className="suggestions">
            {
                suggestions
                    ?
                    <div>
                        <h1>Event suggestions:</h1>
                        {suggestions.map((suggestion, index) => (
                            <div key={index} className="event-card">
                                <p><a href={suggestion.url ? suggestion.url : ""} target="_blank" className="p-link">{`${index + 1}. ${suggestion.name}`}</a></p>
                                <img className="event-img" src={suggestion.images[0].url} />
                            </div>
                        ))}
                    </div>
                    :
                    <p>Still retrieving suggestions...</p>
            }
        </div>
    )
}