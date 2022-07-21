'use strict';
const Parse = require('parse/node')
const request = require('request');
const express = require('express')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const app = express()
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(express.json());
app.use(morgan('tiny'))
const fs = require('fs');
const cors = require('cors');

app.use(cors());

Parse.initialize('78hKdRq48OxfwlPbCkgFfgfquxCqwLiK86y3bjLU', '76IvY9V2pEqghFHqV3mZf8xhcUaPL6WndGCJbGhc');
Parse.serverURL = 'http://parseapi.back4app.com/';

const WEIGHT_MOVIE_GENRES = 0.2;
const WEIGHT_MOVIE_TITLE = 0.05;
const WEIGHT_SHOW_GENRES = 0.2;
const WEIGHT_SHOW_TITLE = 0.05;
const WEIGHT_HOBBY_CATEGORY = 0.25;
const WEIGHT_HOBBY_NAMES = 0.1;
const WEIGHT_TAGS = 0.15;

const INSTA_APP_ID = "390997746348889";
const INSTA_APP_SECRET = "facb6a96ac24a92b82f0a6b254c0ec69";

async function getUserInfo(user) {
    const Movie = Parse.Object.extend("Movie");
    const movieQuery = new Parse.Query(Movie);

    movieQuery.equalTo("User", user);
    const userMovies = await movieQuery.find();

    const Show = Parse.Object.extend("Show");
    const showQuery = new Parse.Query(Show);
    showQuery.equalTo("User", user);
    const userShows = await showQuery.find();

    const Hobby = Parse.Object.extend("Hobby");
    const hobbyQuery = new Parse.Query(Hobby);
    hobbyQuery.equalTo("User", user);
    const userHobbies = await hobbyQuery.find();
    return ({ movies: userMovies, shows: userShows, hobbies: userHobbies, tags: user.get("tags") });
}

function compareArrs(arr1, arr2, weight) {
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

    return (matches / (arr1.length + arr2.length)).toFixed(3) * weight;
}

function calculateCategoryScore(category, prop1, prop2, weight1, weight2) {

    let user1Prop1 = [];
    let user1Prop2 = [];
    for (let i = 0; i < category.user_1.length; i++) {
        user1Prop1 = user1Prop1.concat(category.user_1[i].get(prop1));
        user1Prop2.push(category.user_1[i].get(prop2));
    }

    let user2Prop1 = [];
    let user2Prop2 = [];
    for (let i = 0; i < category.user_2.length; i++) {
        user2Prop1 = user2Prop1.concat(category.user_2[i].get(prop1));
        user2Prop2.push(category.user_2[i].get(prop2));
    }

    if (user1Prop1 && user2Prop1 && user1Prop2 && user2Prop2) {
        let prop1Score = compareArrs(user1Prop1, user2Prop1, weight1);
        let prop2Score = compareArrs(user1Prop2, user2Prop2, weight2);

        return prop1Score + prop2Score;
    }
    return 0
}

function getScore(movies, shows, hobbies, tags) {
    //get movie genre matches
    const movieScore = calculateCategoryScore(movies, "genres", "title", WEIGHT_MOVIE_GENRES, WEIGHT_MOVIE_TITLE);
    const showScore = calculateCategoryScore(shows, "genres", "title", WEIGHT_SHOW_GENRES, WEIGHT_SHOW_TITLE);
    const hobbiesScore = calculateCategoryScore(hobbies, "category", "name", WEIGHT_HOBBY_CATEGORY, WEIGHT_HOBBY_NAMES);
    const tagsScore = compareArrs(tags.user_1, tags.user_2, WEIGHT_TAGS);

    return (movieScore + showScore + hobbiesScore + tagsScore);
}

async function getInterestQuery(currentUser, objectName) {
    const Object = Parse.Object.extend(objectName);
    const query = new Parse.Query(Object);
    query.equalTo("User", currentUser);
    // now contains the movies for this user
    return await query.find();
}

async function getMatches(params, currentUser) {
    const query = new Parse.Query(Parse.User);
    query.notEqualTo("objectId", currentUser.id);
    const entries = await query.find();
    const Match = Parse.Object.extend("Match");

    entries.forEach(async entry => {
        const matchInfo = await getUserInfo(entry);
        const currentUserInfo = await getUserInfo(currentUser);

        if (!entry.get('grad_year')) {
            entry.destroy();
            return;
        }

        const movieInfo = { user_1: currentUserInfo.movies, user_2: matchInfo.movies };
        const showInfo = { user_1: currentUserInfo.shows, user_2: matchInfo.shows };
        const hobbiesInfo = { user_1: currentUserInfo.hobbies, user_2: matchInfo.hobbies };
        const tagsInfo = { user_1: currentUserInfo.tags, user_2: matchInfo.tags };
        const matchScore = getScore(movieInfo, showInfo, hobbiesInfo, tagsInfo);

        //check if match is already in database
        const matchQuery = new Parse.Query(Match);
        matchQuery.equalTo("user_1", currentUser.id);
        matchQuery.equalTo("user_2", entry.id);
        let matchResults = await matchQuery.find();


        if (matchResults.length > 0) {
            for (let i = 0; i < matchResults.length; i++) {
                //update match score if needed
                matchResults[i].set("score", matchScore);
                if (params.matchId == matchResults[i].get("user_2")) {
                    matchResults[i].set("liked", params.liked);
                }
                await matchResults[i].save();
            }
        }
        else {
            const match = new Match();
            if (matchScore) {
                match.set("score", matchScore);
                match.set("liked", false);
                match.set("seen", false);
                match.set("user_1", currentUser.id);
                match.set("user_2", entry.id);
                await match.save();
            }
        }
    })
}

async function retrieveMatchData(limit, offset, currentUser) {
    const Match = Parse.Object.extend("Match");
    const matchQuery = new Parse.Query(Match);

    matchQuery.equalTo("user_1", currentUser.id);
    matchQuery.descending("score");
    matchQuery.limit(parseInt(limit));
    matchQuery.skip(parseInt(offset));

    const matchResults = await matchQuery.find();

    let usersInfo = [];
    let scoreInfo = [];
    let interestsInfo = [];

    for (let i = 0; i < matchResults.length; i++) {
        let userId = matchResults[i].get('user_2');
        const query = new Parse.Query(Parse.User);
        query.equalTo("objectId", userId);
        const userInfo = await query.first();
        const interests = await getUserInfo(userInfo);

        usersInfo.push(userInfo);
        scoreInfo.push({ score: matchResults[i].get('score'), liked: matchResults[i].get('liked'), seen: matchResults[i].get('seen') });
        interestsInfo.push(interests);
    }
    let matchesInfo = usersInfo.map(function (_, i) {
        return {
            userInfo: usersInfo[i],
            scoreInfo: scoreInfo[i],
            interestsInfo: interestsInfo[i]
        };
    });
    return ({ matchesInfo: matchesInfo, matchResults: matchResults, matchMessage: "Matches Retrieved!", typeStatus: "success" });
}

app.post('/login', async (req, res) => {
    const infoUser = req.body;

    try {
        const user = await Parse.User.logIn(infoUser.email, infoUser.password);
        res.send({ userInfo: user, loginMessage: "User logged in!", typeStatus: "success", infoUser: infoUser });
    } catch (error) {
        res.send({ loginMessage: error.message, typeStatus: "danger", infoUser: infoUser });
    }
})

app.post('/logout', async (req, res) => {

    try {
        await Parse.User.logOut();
        res.send({ logoutMessage: "User logged out!", typeStatus: "success" });
    } catch (error) {
        res.send({ logoutMessage: error.message, typeStatus: "danger" });
    }
})

app.post('/signup', async (req, res) => {
    Parse.User.enableUnsafeCurrentUser();
    const infoUser = req.body;
    let user = new Parse.User();

    user.set("username", infoUser.email);
    user.set("email", infoUser.email);
    user.set("password", infoUser.password);
    user.set("preferredName", infoUser.preferredName);

    try {
        await user.signUp();
        await Parse.User.logIn(infoUser.email, infoUser.password);
        res.send({ signupMessage: "User signed up!", typeStatus: 'success', infoUser: infoUser });
    }
    catch (error) {
        res.send({ signupMessage: error.message, typeStatus: 'danger', infoUser: infoUser });
    }
})

app.post('/matches', async (req, res) => {
    Parse.User.enableUnsafeCurrentUser();

    const params = req.body.params;
    const currentUser = Parse.User.current();
    try {
        if (currentUser) {
            getMatches(params, currentUser);
            res.send({ matchMessage: "Matches created", typeStatus: 'success' });
        }
        else {
            res.send({ matchMessage: "Can't get current user", typeStatus: 'danger' });
        }
    }
    catch (error) {
        res.send({ matchMessage: error.message, typeStatus: 'danger' });
    }
})

app.get('/matches', async (req, res) => {
    Parse.User.enableUnsafeCurrentUser();
    const currentUser = Parse.User.current();
    const limit = req.query["limit"];
    const offset = req.query["offset"];
    try {
        if (currentUser) {
            let matchData = await retrieveMatchData(limit, offset, currentUser);
            res.send(matchData);
        }
        else {
            res.send({ matchMessage: "Can't get current user", typeStatus: "danger" });
        }
    }
    catch (err) {
        res.send({ matchMessage: "Error retrieving match", typeStatus: "danger" });
    }
});

app.post('/verify', async (req, res) => {
    Parse.User.enableUnsafeCurrentUser();
    const infoUser = req.body;

    try {
        const currentUser = Parse.User.current();
        if (currentUser) {
            currentUser.set("firstName", infoUser.firstName);
            currentUser.set("lastName", infoUser.lastName);
            currentUser.set("university", infoUser.university);
            currentUser.set("DOB", infoUser.dob);
            await currentUser.save();
            res.send({ userInfo: currentUser, verifyMessage: "User verified!", typeStatus: "success", infoUser: infoUser });
        } else {
            res.send({ verifyMessage: "Can't get current user", typeStatus: "danger", infoUser: infoUser });
        }
    } catch (error) {
        res.send({ verifyMessage: error.message, typeStatus: "danger", infoUser: infoUser });
    }
})

async function removeInterest(objectName, itemKey, itemValue, currentUser) {
    const Object = Parse.Object.extend(objectName);
    const query = new Parse.Query(Object);
    query.equalTo(itemKey, itemValue);
    query.equalTo("User", currentUser);
    const entry = await query.find();
    entry[0].destroy()
}

app.post('/user/interests/remove', async (req, res) => {
    const removeInfo = req.body;
    Parse.User.enableUnsafeCurrentUser();
    const currentUser = Parse.User.current();
    try {
        if (currentUser) {
            if (removeInfo.movie) {
                removeInterest("Movie", "api_key", removeInfo.movie.api_id, currentUser);
            }
            if (removeInfo.show) {
                removeInterest("Show", "api_key", removeInfo.show.api_id, currentUser);
            }
            if (removeInfo.hobby) {
                removeInterest("Hobby", "name", removeInfo.hobby.name, currentUser);
            }
            res.send({ removeMessage: "success", removeInfo: removeInfo, entry: entry[0] });
        }
        else {
            res.send({ removeMessage: "Can't get current user", typeStatus: "danger" });
        }
    }
    catch (error) {
        res.send({ removeMessage: error.message, typeStatus: "danger" });
    }
});

app.get('/user/interests', async (req, res) => {
    Parse.User.enableUnsafeCurrentUser();
    const currentUser = Parse.User.current();
    if (currentUser) {
        //get movies for this user
        const userMovies = await getInterestQuery(currentUser, "Movie");
        // get the shows for this user
        const userShows = await getInterestQuery(currentUser, "Show");
        // get the hobbies for this user
        const userHobbies = await getInterestQuery(currentUser, "Hobby");

        //get full list of hobbies for users to choose from
        const rawdata = fs.readFileSync('data/hobbies.json');
        const hobbiesList = JSON.parse(rawdata);

        res.send({ movies: userMovies, shows: userShows, hobbies: userHobbies, hobbiesList: hobbiesList.hobbies, getInterestsMessage: "Interests Retreived", typeStatus: "success" });
    }
    else {
        res.send({ getInterestsMessage: "Can't get current user", typeStatus: "danger" });
    }
});

app.post('/user/interests', async (req, res) => {
    Parse.User.enableUnsafeCurrentUser();
    const infoInterests = req.body;

    try {
        const Movie = Parse.Object.extend("Movie");
        const movie = new Movie();

        const Show = Parse.Object.extend("Show");
        const show = new Show();

        const Hobby = Parse.Object.extend("Hobby");
        const hobby = new Hobby();

        const currentUser = Parse.User.current();
        if (currentUser) {
            if (infoInterests.interests.movie && infoInterests.interests.movie != "") {
                const query = new Parse.Query(Movie);
                query.equalTo("User", currentUser);
                query.equalTo("api_id", infoInterests.interests.movie.id);
                const entries = await query.find();
                if (!entries[0]) {
                    movie.set("title", infoInterests.interests.movie.title);
                    movie.set("api_id", infoInterests.interests.movie.id);
                    movie.set("genres", infoInterests.interests.movie.genre_ids);
                    movie.set("user", currentUser.id);
                    let usersRelation = movie.relation('User');
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
                    show.set("user", currentUser.objectId);
                    let usersRelation = show.relation('User');
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
                    hobby.set("name", infoInterests.interests.hobby.name)
                    hobby.set("category", infoInterests.interests.hobby.category)
                    let usersRelation = hobby.relation('User');
                    usersRelation.add(currentUser)
                    await hobby.save()
                }
            }
            res.send({ hobby: hobby, show: show, movie: movie, userInfo: currentUser, interestsMessage: "User interests info saved!", typeStatus: "success", infoInterests: infoInterests });
        } else {
            res.send({ hobby: hobby, show: show, movie: movie, userInfo: "", interestsMessage: "Can't get current user", typeStatus: "danger", infoInterests: infoInterests });
        }
    } catch (error) {
        res.send({ interestsMessage: error.message, typeStatus: "danger", infoInterests: infoInterests });
    }
})

app.post('/user/update', async (req, res) => {
    Parse.User.enableUnsafeCurrentUser();
    const infoUser = req.body;

    try {
        const currentUser = Parse.User.current();
        if (currentUser) {
            if (infoUser.accessToken) {
                currentUser.set("ig_access_token", infoUser.accessToken);
            }
            await currentUser.save();
            res.send({ userInfo: currentUser, updateInfoMessage: "User basic info saved!", typeStatus: "success", infoUser: infoUser });
        } else {
            res.send({ userInfo: "", updateInfoMessage: "Can't get current user", typeStatus: "danger", infoUser: infoUser });
        }
    } catch (error) {
        res.send({ updateInfoMessage: error.message, typeStatus: "danger", infoUser: infoUser });
    }
})

app.post('/user/basic', async (req, res) => {
    Parse.User.enableUnsafeCurrentUser();
    const infoUser = req.body;

    try {
        const currentUser = Parse.User.current();
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
            await currentUser.save()
            res.send({ userInfo: currentUser, saveInfoMessage: "User basic info saved!", typeStatus: "success", infoUser: infoUser });
        } else {
            res.send({ userInfo: "", saveInfoMessage: "Can't get current user", typeStatus: "danger", infoUser: infoUser });
        }
    } catch (error) {
        res.send({ saveInfoMessage: error.message, typeStatus: "danger", infoUser: infoUser });
    }
})

function requestToken(res, redirect_uri, code, userInfo, params) {
    // send form based request to Instagram API
    request.post({
        url: 'https://api.instagram.com/oauth/access_token',
        form: {
            client_id: INSTA_APP_ID,
            client_secret: INSTA_APP_SECRET,
            grant_type: 'authorization_code',
            redirect_uri,
            code
        }
    },
        function (err, httpResponse, body) {
            let result = JSON.parse(body);
            if (result.access_token) {
                // Got access token. Parse string response to JSON
                let accessToken = result.access_token;
                res.send({ params: params, userInfo: userInfo, result: result, accessToken: accessToken, typeStatus: "success" });
            }
        });
}

app.post('/init-insta', async (req, res) => {
    // data from frontend
    let code = req.body.code;
    let redirect_uri = req.body.redirectUri;
    let objectId = req.body.objectId;

    const query = new Parse.Query(Parse.User);
    query.equalTo("objectId", objectId);
    const userInfo = await query.first();
    try {
        requestToken(res, redirect_uri, code, userInfo, req.body);
    } catch (e) {
        res.send({ request: req.body, instaMessage: "short term access token failed", typeStatus: "danger", error: e, userInfo: userInfo });
    }
})
module.exports = app;