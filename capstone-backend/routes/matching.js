const express = require("express");
const router = express.Router();
const Parse = require("parse/node");
const config = require("config");

const getUserEntries = async (className, user) => {
  const Object = Parse.Object.extend(className);
  const objectQuery = new Parse.Query(Object);

  objectQuery.equalTo("User", user);
  const userObjects = await objectQuery.find();
  return userObjects;
};

const getUserInfo = async (user) => {
  const userMovies = await getUserEntries("Movie", user);
  const userShows = await getUserEntries("Show", user);
  const userHobbies = await getUserEntries("Hobby", user);

  return {
    movies: userMovies,
    shows: userShows,
    hobbies: userHobbies,
    tags: user.get("tags"),
    music: user.get("spotify_artists"),
    major: user.get("major"),
    hometown: user.get("hometown"),
    gradYear: user.get("grad_year"),
    university: user.get("university"),
  };
};

const compareArrs = (arr1, arr2, weight) => {
  if (!arr1 || !arr2) {
    return 0;
  }
  let matches = 0;
  for (let i = 0; i < arr1.length; i++) {
    // we want to know if a[i] is found in b
    let match = false; // we haven't found it yet
    for (let j = 0; j < arr2.length; j++) {
      if (arr1[i] == arr2[j]) {
        // we have found a[i] in b, so we can stop searching
        match = true;
        break;
      }
      // if we never find a[i] in b, the for loop will simply end,
      // and match will remain false
    }
    // add a[i] to newArray only if we found a match
    if (match) {
      matches++;
    }
  }
  let total = arr1.length + arr2.length;
  if (total == 0) {
    return 0;
  }

  return (matches / arr1.length).toFixed(3) * weight;
};

const calculateClassScore = (category, prop1, prop2, weight1, weight2) => {
  if (!category?.user_1?.length || !category?.user_2?.length) {
    return 0;
  }
  let user1Prop1 = [];
  let user1Prop2 = [];
  for (let i = 0; i < category.user_1.length; i++) {
    if (Array.isArray(category.user_1[i].get(prop1))) {
      user1Prop1 = user1Prop1.concat(category.user_1[i].get(prop1));
    } else {
      user1Prop1.push(category.user_1[i].get(prop1));
    }
    user1Prop2.push(category.user_1[i].get(prop2));
  }

  let user2Prop1 = [];
  let user2Prop2 = [];
  for (let i = 0; i < category.user_2.length; i++) {
    if (Array.isArray(category.user_2[i].get(prop1))) {
      user2Prop1 = user2Prop1.concat(category.user_2[i].get(prop1));
    } else {
      user2Prop1.push(category.user_2[i].get(prop1));
    }
    user2Prop2.push(category.user_2[i].get(prop2));
  }
  try {
    let prop1Score = compareArrs(user1Prop1, user2Prop1, weight1);
    let prop2Score = compareArrs(user1Prop2, user2Prop2, weight2);

    return prop1Score + prop2Score;
  } catch (err) {
    console.log("error", err);
    return 0;
  }
};

const calculateUserPropertyScore = (
  category,
  prop1,
  prop2,
  weight1,
  weight2
) => {
  if (!category?.user_1?.length || !category?.user_2?.length) {
    return 0;
  }
  let user1Prop1 = [];
  let user1Prop2 = [];
  for (let i = 0; i < category.user_1.length; i++) {
    if (Array.isArray(category.user_1[i][prop1])) {
      user1Prop1 = user1Prop1.concat(category.user_1[i][prop1]);
    } else {
      user1Prop1.push(category.user_1[i][prop1]);
    }
    user1Prop2.push(category.user_1[i][prop2]);
  }

  let user2Prop1 = [];
  let user2Prop2 = [];
  for (let i = 0; i < category.user_2.length; i++) {
    if (Array.isArray(category.user_2[i][prop1])) {
      user2Prop1 = user2Prop1.concat(category.user_2[i][prop1]);
    } else {
      user2Prop1.push(category.user_2[i][prop1]);
    }
    user2Prop2.push(category.user_2[i][prop2]);
  }
  let prop1Score = compareArrs(user1Prop1, user2Prop1, weight1);
  let prop2Score = compareArrs(user1Prop2, user2Prop2, weight2);

  return prop1Score + prop2Score;
};

const compareStrings = (str1, str2, weight) => {
  if (!str1 || !str2) {
    return 0;
  } else {
    str1 = str1.toLowerCase();
    str2 = str2.toLowerCase();
    if (str1.includes(str2) || str2.includes(str1)) {
      return weight;
    } else {
      return 0;
    }
  }
};

const calculateGradYearScore = (year1, year2, weight) => {
  let score = (4 - Math.abs(parseInt(year1) - parseInt(year2))) / 4;
  if (score > 0) {
    return score * weight;
  }
  return 0;
};

const getScore = (
  movies,
  shows,
  hobbies,
  tags,
  music,
  major,
  hometown,
  gradYear
) => {
  //get movie genre matches
  const movieScore = calculateClassScore(
    movies,
    "genres",
    "title",
    config.get("MATCH_WEIGHTS.WEIGHT_MOVIE_GENRES"),
    config.get("MATCH_WEIGHTS.WEIGHT_MOVIE_TITLE")
  );
  const showScore = calculateClassScore(
    shows,
    "genres",
    "title",
    config.get("MATCH_WEIGHTS.WEIGHT_SHOW_GENRES"),
    config.get("MATCH_WEIGHTS.WEIGHT_SHOW_TITLE")
  );
  const hobbiesScore = calculateClassScore(
    hobbies,
    "category",
    "name",
    config.get("MATCH_WEIGHTS.WEIGHT_HOBBY_CATEGORY"),
    config.get("MATCH_WEIGHTS.WEIGHT_HOBBY_NAMES")
  );
  const musicScore = calculateUserPropertyScore(
    music,
    "genres",
    "name",
    config.get("MATCH_WEIGHTS.WEIGHT_MUSIC_GENRES"),
    config.get("MATCH_WEIGHTS.WEIGHT_MUSIC_ARTIST")
  );
  const tagsScore = compareArrs(
    tags.user_1,
    tags.user_2,
    config.get("MATCH_WEIGHTS.WEIGHT_TAGS")
  );
  const majorScore = compareStrings(
    major.user_1?.name,
    major.user_2?.name,
    config.get("MATCH_WEIGHTS.WEIGHT_MAJOR")
  );
  const departmentScore = compareStrings(
    major.user_1?.department,
    major.user_2?.department,
    config.get("MATCH_WEIGHTS.WEIGHT_DEPARTMENT")
  );
  const hometownScore = compareStrings(
    hometown.user_1,
    hometown.user_2,
    config.get("MATCH_WEIGHTS.WEIGHT_HOMETOWN")
  );
  const gradYearScore = calculateGradYearScore(
    gradYear.user_1,
    gradYear.user_2,
    config.get("MATCH_WEIGHTS.WEIGHT_GRADYEAR")
  );

  return (
    movieScore +
    showScore +
    hobbiesScore +
    musicScore +
    tagsScore +
    majorScore +
    departmentScore +
    hometownScore +
    gradYearScore
  );
};

const updateMatch = async (params, currentUser, res) => {
  const Match = Parse.Object.extend("Match");
  const matchQuery = new Parse.Query(Match);
  matchQuery.equalTo("user_1", currentUser.id);
  matchQuery.equalTo("user_2", params.matchId);
  let matchResults = await matchQuery.first();

  matchResults.set("liked", params.liked);
  await matchResults.save();
  //match can view current user's private information if match has been created
  const privateInfoQuery = new Parse.Query(Match);
  privateInfoQuery.equalTo("user_2", currentUser.id);
  privateInfoQuery.equalTo("user_1", params.matchId);
  let privateInfoResults = await privateInfoQuery.first();
  if (privateInfoResults) {
    privateInfoResults.set("display_private", params.liked);
    await privateInfoResults.save();
  }
  res.send({
    matchMessage: "Match updated",
    typeStatus: "success",
    params: params,
    privateInfoResults: privateInfoResults,
  });
};

const createNewMatch = async (match, matchScore, user1, user2) => {
  match.set("score", matchScore);
  match.set("liked", false);
  match.set("user_1", user1);
  match.set("user_2", user2);
  match.set("display_private", false);
  await match.save();
};

const getMatches = async (currentUser, res) => {
  const query = new Parse.Query(Parse.User);
  query.notEqualTo("objectId", currentUser.id);
  const entries = await query.find();

  const Match = Parse.Object.extend("Match");

  const currentUserInfo = await getUserInfo(currentUser);
  entries.forEach(async (entry) => {
    const matchInfo = await getUserInfo(entry);
    //only run if users go to the same college
    if (matchInfo.university === currentUserInfo.university) {
      const movieInfo = {
        user_1: currentUserInfo.movies,
        user_2: matchInfo.movies,
      };
      const showInfo = {
        user_1: currentUserInfo.shows,
        user_2: matchInfo.shows,
      };
      const hobbiesInfo = {
        user_1: currentUserInfo.hobbies,
        user_2: matchInfo.hobbies,
      };
      const tagsInfo = { user_1: currentUserInfo.tags, user_2: matchInfo.tags };
      const musicInfo = {
        user_1: currentUserInfo.music,
        user_2: matchInfo.music,
      };
      const majorInfo = {
        user_1: currentUserInfo.major,
        user_2: matchInfo.major,
      };
      const hometownInfo = {
        user_1: currentUserInfo.hometown,
        user_2: matchInfo.hometown,
      };
      const gradYearInfo = {
        user_1: currentUserInfo.gradYear,
        user_2: matchInfo.gradYear,
      };
      const matchScore = getScore(
        movieInfo,
        showInfo,
        hobbiesInfo,
        tagsInfo,
        musicInfo,
        majorInfo,
        hometownInfo,
        gradYearInfo
      );

      //check if match is already in database
      const matchQuery = new Parse.Query(Match);
      matchQuery.equalTo("user_1", currentUser.id);
      matchQuery.equalTo("user_2", entry.id);
      let matchResults = await matchQuery.first();

      const matchQuery2 = new Parse.Query(Match);
      matchQuery2.equalTo("user_2", currentUser.id);
      matchQuery2.equalTo("user_1", entry.id);
      let matchResults2 = await matchQuery2.first();

      if (matchResults) {
        if (matchResults.get("score") != matchScore) {
          matchResults.set("score", matchScore);
          matchResults2.set("score", matchScore);
          await matchResults.save();
          await matchResults2.save();
        }
      } else {
        const match = new Match();
        const match2 = new Match();
        if (matchScore) {
          createNewMatch(match, matchScore, currentUser.id, entry.id);
          createNewMatch(match2, matchScore, entry.id, currentUser.id);
        }
      }
    }
  });
  res.send({ matchMessage: "Matches created", typeStatus: "success" });
};

const retrieveMatchData = async (limit, offset, liked, currentUser) => {
  const Match = Parse.Object.extend("Match");
  const matchQuery = new Parse.Query(Match);
  let likedBool = liked === "true";

  matchQuery.equalTo("user_1", currentUser.id);
  matchQuery.equalTo("liked", likedBool);
  matchQuery.descending("score");
  matchQuery.limit(parseInt(limit));
  matchQuery.skip(parseInt(offset));

  const matchResults = await matchQuery.find();

  let usersInfo = [];
  let scoreInfo = [];
  let interestsInfo = [];

  for (let i = 0; i < matchResults.length; i++) {
    let userId = matchResults[i].get("user_2");
    const query = new Parse.Query(Parse.User);
    query.equalTo("objectId", userId);
    const userInfo = await query.first();
    const interests = await getUserInfo(userInfo);

    usersInfo.push(userInfo);
    scoreInfo.push({
      score: matchResults[i].get("score"),
      liked: matchResults[i].get("liked"),
      display_private: matchResults[i].get("display_private"),
    });
    interestsInfo.push(interests);
  }
  let matchesInfo = usersInfo.map(function (_, i) {
    return {
      userInfo: usersInfo[i],
      scoreInfo: scoreInfo[i],
      interestsInfo: interestsInfo[i],
    };
  });
  return {
    matchesInfo: matchesInfo,
    matchResults: matchResults,
    matchMessage: "Matches Retrieved!",
    typeStatus: "success",
  };
};

router.post("/", async (req, res) => {
  const params = req.body.params;
  const currentUser = await Parse.User.become(req.body.sessionToken);
  try {
    if (currentUser) {
      if (params.matchId) {
        updateMatch(params, currentUser, res);
      } else {
        getMatches(currentUser, res);
      }
    } else {
      res.send({
        matchMessage: "Can't get current user",
        typeStatus: "danger",
      });
    }
  } catch (error) {
    res.send({ matchMessage: error.message, typeStatus: "danger" });
  }
});

router.get("/", async (req, res) => {
  const currentUser = await Parse.User.become(req.query["sessionToken"]);
  const limit = req.query["limit"];
  const offset = req.query["offset"];
  const liked = req.query["liked"];
  try {
    if (currentUser) {
      let matchData = await retrieveMatchData(
        limit,
        offset,
        liked,
        currentUser
      );
      res.send(matchData);
    } else {
      res.send({
        matchMessage: "Can't get current user",
        typeStatus: "danger",
      });
    }
  } catch (err) {
    res.send({ matchMessage: "Error retrieving match", typeStatus: "danger" });
  }
});

module.exports = router;
