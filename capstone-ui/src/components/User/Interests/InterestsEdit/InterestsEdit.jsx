import * as React from "react";
import "./InterestsEdit.css";
import { useState } from "react";
import Loading from "../../../Loading/Loading";
import Select from "react-select";

export default function InterestsEdit({
  userInfo,
  onClickBasic,
  onClickMedia,
  saveInterests,
  getMovieSearch,
  movie,
  removeMovie,
  isFetching,
  getTVSearch,
  TV,
  removeShow,
  setSelectedHobbyOption,
  selectedHobbyOption,
  hobbiesList,
  removeHobby,
  addNewHobby,
  onClickSpotify,
}) {
  const [movieClass, setMovieClass] = useState("hidden");
  const [tvClass, setTvClass] = useState("hidden");
  const [hobbyClass, setHobbyClass] = useState("hidden");
  const [selectedOption, setSelectedOption] = useState(null);

  const toggleMovieClass = () => {
    if (movieClass == "movie-input") {
      setMovieClass("hidden");
    } else {
      setMovieClass("movie-input");
    }
  };

  const toggleTVClass = () => {
    if (tvClass == "movie-input") {
      setTvClass("hidden");
    } else {
      setTvClass("movie-input");
    }
  };

  const toggleHobbyClass = () => {
    if (hobbyClass == "movie-input") {
      setHobbyClass("hidden");
    } else {
      setHobbyClass("movie-input");
    }
  };

  return isFetching ? (
    <Loading></Loading>
  ) : (
    <div className="interests" id="interests">
      <div className="row">
        <div className="column">
          <img src={userInfo.profile_photo} alt="" className="profile-img" />
          <h2 className="user-name">{userInfo.preferredName}</h2>
          <div className="user-info">
            <p onClick={onClickBasic} className="menu-item">
              Basic Info
            </p>
            <p className="menu-item active">Interests</p>
            <p onClick={onClickMedia} className="menu-item">
              Media
            </p>
          </div>
        </div>
        <div className="column col-2">
          {/* Movies */}
          <p className="interests-title">Movies:</p>
          {userInfo?.interests?.movies &&
          Array.isArray(userInfo.interests.movies)
            ? userInfo.interests.movies.map((movie, index) => (
                <div key={index} className="movie-item">
                  <p className="movie-text">{movie.title}</p>
                  <p
                    className="movie-text remove-movie"
                    onClick={() => {
                      removeMovie(movie, index);
                    }}
                  >
                    {" "}
                    x
                  </p>
                </div>
              ))
            : null}
          <br />
          {movieClass == "hidden" ? (
            <div>
              <button
                className="add-interest-button"
                onClick={toggleMovieClass}
              >
                Add a movie
              </button>
            </div>
          ) : (
            <input
              id="enter-movie"
              className={movieClass}
              type="text"
              onChange={getMovieSearch}
            />
          )}
          {movie && movie != "" ? (
            <div className="movie-item">
              <p className="movie-text">{movie.title}</p>
            </div>
          ) : null}
          {/* TV Shows */}
          <p className="interests-title">TV Shows:</p>
          {userInfo?.interests?.shows && Array.isArray(userInfo.interests.shows)
            ? userInfo.interests.shows.map((show, index) => (
                <div key={index} className="movie-item">
                  <p className="movie-text">{show.title}</p>
                  <p
                    className="movie-text remove-movie"
                    onClick={() => {
                      removeShow(show, index);
                    }}
                  >
                    {" "}
                    x
                  </p>
                </div>
              ))
            : null}
          <br />
          {tvClass == "hidden" ? (
            <div>
              <button className="add-interest-button" onClick={toggleTVClass}>
                Add a TV Show
              </button>
            </div>
          ) : (
            <input
              id="enter-tv"
              className={tvClass}
              type="text"
              onChange={getTVSearch}
            />
          )}
          {TV && TV != "" ? (
            <div className="movie-item">
              <p className="movie-text">{TV.name}</p>
            </div>
          ) : null}
          {/* Music */}
          <p className="interests-title">Music:</p>
          {userInfo.spotify_artists ? (
            <div>
              <p className="spotify-artist">
                <b>Top Spotify Artists:</b>
              </p>
              {userInfo.spotify_artists.map((artist, index) => (
                <div key={index}>
                  <p className="spotify-artist">
                    <b>{`${index + 1}. ${artist.name}`}</b>
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <button className="login-btn spotify-btn" onClick={onClickSpotify}>
              Connect to Spotify
            </button>
          )}

          {/* Hobbies */}
          <p className="interests-title">Hobbies:</p>
          {userInfo?.interests?.hobbies &&
          Array.isArray(userInfo.interests.hobbies)
            ? userInfo.interests.hobbies.map((hobby, index) => (
                <div key={index} className="movie-item">
                  <p className="movie-text">{hobby.name}</p>
                  <p
                    className="movie-text remove-movie"
                    onClick={() => {
                      removeHobby(hobby, index);
                    }}
                  >
                    {" "}
                    x
                  </p>
                </div>
              ))
            : null}
          {hobbiesList && hobbiesList != [] && hobbyClass != "hidden" ? (
            <div>
              <p>Select a category:</p>
              <Select
                id="hobby-category-select"
                className="search-select"
                defaultValue={selectedOption}
                onChange={setSelectedOption}
                options={hobbiesList.map((hobby, index) => {
                  return { label: hobby.category, value: index };
                })}
              />
            </div>
          ) : (
            <div>
              <button
                className="add-interest-button"
                onClick={toggleHobbyClass}
              >
                Add a Hobby
              </button>
            </div>
          )}
          {selectedOption && hobbyClass != "hidden" ? (
            <div>
              <p>Select a hobby:</p>
              <Select
                id="hobby-select"
                className="search-select"
                defaultValue={selectedHobbyOption}
                onChange={setSelectedHobbyOption}
                options={hobbiesList[selectedOption.value].options.map(
                  (hobby) => {
                    return {
                      label: hobby,
                      value: {
                        name: hobby,
                        category: selectedOption.label,
                        hobbyIndex: selectedOption.value,
                      },
                    };
                  }
                )}
              />
              {selectedHobbyOption ? null : (
                <div>
                  <p>Or add your own:</p>
                  <input
                    id="enter-hobby"
                    className={hobbyClass}
                    type="text"
                    onChange={() =>
                      addNewHobby(selectedOption.label, selectedOption.value)
                    }
                  />
                </div>
              )}
            </div>
          ) : null}
          <button
            className="login-btn"
            onClick={() => {
              saveInterests();
              setSelectedHobbyOption(null);
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
