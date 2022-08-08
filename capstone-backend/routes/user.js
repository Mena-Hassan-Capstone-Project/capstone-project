const express = require("express");
const router = express.Router();
const Parse = require("parse/node");
const fs = require("fs");

const getInterestQuery = async (currentUser, objectName) => {
  const Object = await Parse.Object.extend(objectName);
  const query = new Parse.Query(Object);
  query.equalTo("User", currentUser);
  // now contains the movies for this user
  return await query.find();
};

const removeInterest = async (objectName, itemKey, itemValue, currentUser) => {
  const Object = Parse.Object.extend(objectName);
  const query = new Parse.Query(Object);
  query.equalTo(itemKey, itemValue);
  query.equalTo("User", currentUser);
  const entry = await query.find();
  if (entry.length > 0) {
    entry[0].destroy();
  }
};

router.post("/interests/remove", async (req, res) => {
  const removeInfo = req.body;
  const currentUser = await Parse.User.become(removeInfo.sessionToken);
  try {
    if (currentUser) {
      if (removeInfo.movie) {
        removeInterest("Movie", "api_id", removeInfo.movie.api_id, currentUser);
      }
      if (removeInfo.show) {
        removeInterest("Show", "api_id", removeInfo.show.api_id, currentUser);
      }
      if (removeInfo.hobby) {
        removeInterest("Hobby", "name", removeInfo.hobby.name, currentUser);
      }
      res.send({
        removeMessage: "success",
        removeInfo: removeInfo,
        entry: entry[0],
      });
    } else {
      res.send({
        removeMessage: "Can't get current user",
        typeStatus: "danger",
      });
    }
  } catch (error) {
    res.send({ removeMessage: error.message, typeStatus: "danger" });
  }
});

router.get("/interests", async (req, res) => {
  const currentUser = await Parse.User.become(req.query["sessionToken"]);
  if (currentUser) {
    //get movies for this user
    const userMovies = await getInterestQuery(currentUser, "Movie");
    // get the shows for this user
    const userShows = await getInterestQuery(currentUser, "Show");
    // get the hobbies for this user
    const userHobbies = await getInterestQuery(currentUser, "Hobby");

    //get full list of hobbies for users to choose from
    const rawdata = fs.readFileSync("data/hobbies.json");
    const hobbiesList = await JSON.parse(rawdata);

    res.send({
      movies: userMovies,
      shows: userShows,
      hobbies: userHobbies,
      hobbiesList: hobbiesList.hobbies,
      getInterestsMessage: "Interests Retreived",
      typeStatus: "success",
    });
  } else {
    res.send({
      getInterestsMessage: "Can't get current user",
      typeStatus: "danger",
    });
  }
});

router.post("/interests", async (req, res) => {
  const infoInterests = req.body;

  const currentUser = await Parse.User.become(infoInterests.sessionToken);
  try {
    const Movie = Parse.Object.extend("Movie");
    const movie = new Movie();

    const Show = Parse.Object.extend("Show");
    const show = new Show();

    const Hobby = Parse.Object.extend("Hobby");
    const hobby = new Hobby();

    const rawdata = fs.readFileSync("data/hobbies.json");
    const hobbiesList = await JSON.parse(rawdata);

    if (currentUser) {
      if (
        infoInterests.interests.movie &&
        infoInterests.interests.movie != ""
      ) {
        const query = new Parse.Query(Movie);
        query.equalTo("User", currentUser);
        query.equalTo("api_id", infoInterests.interests.movie.id);
        const entries = await query.find();
        if (!entries[0]) {
          movie.set("title", infoInterests.interests.movie.title);
          movie.set("api_id", infoInterests.interests.movie.id);
          movie.set("genres", infoInterests.interests.movie.genre_ids);
          let usersRelation = movie.relation("User");
          usersRelation.add(currentUser);
          await movie.save();
        }
      }
      if (infoInterests.interests.TV && infoInterests.interests.TV != "") {
        const query = new Parse.Query(Show);
        query.equalTo("User", currentUser);
        query.equalTo("api_id", infoInterests.interests.TV.id);
        const entries = await query.find();
        if (!entries[0]) {
          show.set("title", infoInterests.interests.TV.name);
          show.set("api_id", infoInterests.interests.TV.id);
          show.set("genres", infoInterests.interests.TV.genre_ids);
          let usersRelation = show.relation("User");
          usersRelation.add(currentUser);
          await show.save();
        }
      }
      if (infoInterests.interests.hobby) {
        const query = new Parse.Query(Hobby);
        query.equalTo("User", currentUser);
        query.equalTo("name", infoInterests.interests.hobby.name);
        const entries = await query.find();
        if (!entries[0]) {
          let currentHobbies =
            hobbiesList.hobbies[infoInterests.interests.hobby.hobbyIndex];
          //add new hobby to data json
          if (
            !currentHobbies.options.includes(infoInterests.interests.hobby.name)
          ) {
            currentHobbies.options.push(infoInterests.interests.hobby.name);
            hobbiesList.hobbies[infoInterests.interests.hobby.hobbyIndex] =
              currentHobbies;
            const newData = JSON.stringify(hobbiesList);
            fs.writeFile("data/hobbies.json", newData, (err) => {
              // error checking
              if (err) throw err;
            });
          }
          hobby.set("name", infoInterests.interests.hobby.name);
          hobby.set("category", infoInterests.interests.hobby.category);
          let usersRelation = hobby.relation("User");
          usersRelation.add(currentUser);
          await hobby.save();
        }
      }
      res.send({
        hobby: hobby,
        show: show,
        movie: movie,
        userInfo: currentUser,
        interestsMessage: "User interests info saved!",
        typeStatus: "success",
        infoInterests: infoInterests,
      });
    } else {
      res.send({
        hobby: hobby,
        show: show,
        movie: movie,
        userInfo: "",
        interestsMessage: "Can't get current user",
        typeStatus: "danger",
        infoInterests: infoInterests,
      });
    }
  } catch (error) {
    res.send({
      interestsMessage: error.message,
      typeStatus: "danger",
      infoInterests: infoInterests,
    });
  }
});

router.post("/update", async (req, res) => {
  const infoUser = req.body;
  const currentUser = await Parse.User.become(infoUser.sessionToken);

  try {
    if (currentUser) {
      if (infoUser.accessToken) {
        currentUser.set("ig_access_token", infoUser.accessToken);
      }
      if (infoUser.username) {
        currentUser.set("ig_username", infoUser.username);
      }
      if (infoUser.photos) {
        currentUser.set("ig_media", infoUser.photos);
      }
      if (infoUser.spotify_artists) {
        currentUser.set("spotify_artists", infoUser.spotify_artists);
      }
      if (infoUser.spotify_access_token) {
        currentUser.set("spotify_access_token", infoUser.spotify_access_token);
      }
      if (infoUser.spotify_refresh_token) {
        currentUser.set(
          "spotify_refresh_token",
          infoUser.spotify_refresh_token
        );
      }
      await currentUser.save();
      res.send({
        userInfo: currentUser,
        updateInfoMessage: "User basic info saved!",
        typeStatus: "success",
        infoUser: infoUser,
      });
    } else {
      res.send({
        userInfo: "",
        updateInfoMessage: "Can't get current user",
        typeStatus: "danger",
        infoUser: infoUser,
      });
    }
  } catch (error) {
    res.send({
      updateInfoMessage: error.message,
      typeStatus: "danger",
      infoUser: infoUser,
    });
  }
});

router.post("/basic", async (req, res) => {
  const infoUser = req.body;
  try {
    const currentUser = await Parse.User.become(infoUser.sessionToken);
    if (currentUser) {
      if (infoUser.year && infoUser.year != "") {
        currentUser.set("grad_year", infoUser.year);
      }
      if (infoUser.major && infoUser.major != "") {
        currentUser.set("major", infoUser.major);
      }
      if (infoUser.hometown && infoUser.hometown != "") {
        currentUser.set("hometown", infoUser.hometown);
      }
      if (infoUser.profile_photo && infoUser.profile_photo != "") {
        currentUser.set("profile_photo", infoUser.profile_photo);
      }
      if (infoUser.tags) {
        currentUser.set("tags", infoUser.tags);
      }
      if (infoUser.media) {
        currentUser.set("media", infoUser.media);
      }
      await currentUser.save();
      res.send({
        userInfo: currentUser,
        saveInfoMessage: "User basic info saved!",
        typeStatus: "success",
        infoUser: infoUser,
      });
    } else {
      res.send({
        userInfo: "",
        saveInfoMessage: "Can't get current user",
        typeStatus: "danger",
        infoUser: infoUser,
      });
    }
  } catch (error) {
    res.send({
      saveInfoMessage: error.message,
      typeStatus: "danger",
      infoUser: infoUser,
    });
  }
});

module.exports = router;
