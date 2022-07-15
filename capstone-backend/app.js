'use strict';
const Parse = require('parse/node')
const express = require('express')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const app = express()
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(express.json());
app.use(morgan('tiny'))
const fs = require('fs');
let cors = require('cors')

app.use(cors())

Parse.initialize('78hKdRq48OxfwlPbCkgFfgfquxCqwLiK86y3bjLU', '76IvY9V2pEqghFHqV3mZf8xhcUaPL6WndGCJbGhc')
Parse.serverURL = 'http://parseapi.back4app.com/'

async function getUserInfo(user){
    const Movie = Parse.Object.extend("Movie");
    const movieQuery = new Parse.Query(Movie);

    movieQuery.equalTo("User", user);
    movieQuery.equalTo("active", true);
    const userMovies = await movieQuery.find();

    const Show = Parse.Object.extend("Show");
    const showQuery = new Parse.Query(Show);
    showQuery.equalTo("User", user);
    showQuery.equalTo("active", true);
    const userShows = await showQuery.find();

    const Hobby = Parse.Object.extend("Hobby");
    const hobbyQuery = new Parse.Query(Hobby);
    hobbyQuery.equalTo("User", user);
    hobbyQuery.equalTo("active", true);
    const userHobbies = await hobbyQuery.find();
    return({movies : userMovies, shows : userShows, hobbies : userHobbies, tags : user.get("tags")});
}

function compareArrs(arr_1, arr_2, weight){
    var matches = 0;
    for (var i = 0; i < arr_1.length; i++) {
        // we want to know if a[i] is found in b
        var match = false; // we haven't found it yet
        for (var j = 0; j < arr_2.length; j++) {
            if (arr_1[i] == arr_2[j]) {
                // we have found a[i] in b, so we can stop searching
                match = true;
                break;
            }
            // if we never find a[i] in b, the for loop will simply end,
            // and match will remain false
        }
        // add a[i] to newArray only if we found a match
        if (match) {
            matches ++;
        }
    }

    return (matches / (arr_1.length + arr_2.length)) * weight
}

function getScore(movies, shows, hobbies, tags){
    //get movie genre matches
    let user1MovieGenres = []
    let user1Movies = []
    for (let i = 0; i < movies.user_1.length; i++) {
        user1MovieGenres = user1MovieGenres.concat(movies.user_1[i].get('genres'))
        user1Movies.push(movies.user_1[i].get('title'))
    }
    let user2MovieGenres = []
    let user2Movies = []
    for (let i = 0; i < movies.user_2.length; i++) {
        user2MovieGenres = user2MovieGenres.concat(movies.user_2[i].get('genres'))
        user2Movies.push(movies.user_2[i].get('title'))
    }
    let movieGenreScore = compareArrs(user1MovieGenres, user2MovieGenres, 0.2)
    let movieTitleScore = compareArrs(user1Movies, user2Movies, 0.05)

    //get tv genre matches
    let user1ShowGenres = []
    let user1Shows = []
    for (let i = 0; i < shows.user_1.length; i++) {
        user1ShowGenres = user1ShowGenres.concat(shows.user_1[i].get('genres'))
        user1Shows.push(shows.user_1[i].get('title'))
    }
    let user2ShowGenres = []
    let user2Shows = []
    for (let i = 0; i < shows.user_2.length; i++) {
        user2ShowGenres = user2ShowGenres.concat(shows.user_2[i].get('genres'))
        user2Shows.push(shows.user_2[i].get('title'))
    }
    let showGenreScore = compareArrs(user1ShowGenres, user2ShowGenres, 0.2)
    let showTitleScore = compareArrs(user1Shows, user2Shows, 0.05)

    //get hobby matches
    let user1HobbyCategories = []
    let user1Hobbies = []
    for (let i = 0; i < hobbies.user_1.length; i++) {
        user1HobbyCategories.push(hobbies.user_1[i].get('category'))
        user1Hobbies.push(hobbies.user_1[i].get('name'))
    }
    let user2HobbyCategories = []
    let user2Hobbies = []
    for (let i = 0; i < hobbies.user_2.length; i++) {
        user2HobbyCategories.push(hobbies.user_2[i].get('category'))
        user2Hobbies.push(hobbies.user_2[i].get('name'))
    }
    let hobbyCategoryScore = compareArrs(user1HobbyCategories, user2HobbyCategories, 0.25)
    let hobbyScore = compareArrs(user1Hobbies, user2Hobbies, 0.1)

    let tagsScore = compareArrs(tags.user_1, tags.user_2, 0.15)
    return (movieGenreScore + movieTitleScore + showGenreScore + showTitleScore + hobbyCategoryScore + hobbyScore + tagsScore)
}

app.post('/login', async(req, res) => {
    let infoUser = req.body

    try{
        let user = await Parse.User.logIn(infoUser.email, infoUser.password)
        res.send({userInfo : user, loginMessage: "User logged in!", typeStatus: "success",  infoUser: infoUser});
      } catch (error){
        res.send({loginMessage: error.message, typeStatus: "danger",  infoUser: infoUser});
      }
})

app.post('/logout', async(req, res) => {

    try{
        await Parse.User.logOut()
        res.send({logoutMessage: "User logged out!", typeStatus: "success"});
      } catch (error){
        res.send({logoutMessage: error.message, typeStatus: "danger"});
      }
})

app.post('/signup', async(req, res) => {
    Parse.User.enableUnsafeCurrentUser()
    let infoUser = req.body
    let user = new Parse.User()

    user.set("username", infoUser.email)
    user.set("email", infoUser.email)
    user.set("password", infoUser.password)
    user.set("preferredName", infoUser.preferredName)

    try{
        await user.signUp()
        res.send({signupMessage : "User signed up!", typeStatus : 'success', infoUser : infoUser})
        let userLogin = await Parse.User.logIn(infoUser.email, infoUser.password)
    }
    catch(error){
        res.send({signupMessage : error.message, typeStatus : 'danger', infoUser : infoUser})
    }
})

app.post('/getMatch', async(req, res) => {
    Parse.User.enableUnsafeCurrentUser()

    let params = req.body.params
    console.log("create match")
    console.log("params", req.body.params)
    let  currentUser = Parse.User.current();
    try{
        if(currentUser){
            const query = new Parse.Query(Parse.User);
            query.notEqualTo("objectId",  currentUser.id);
            const entries = await query.find()
            const Match = Parse.Object.extend("Match");

            console.log("entries", entries.length)
            for (let i = 0; i < entries.length; i++){
                let entry = entries[i]
                let matchInfo = await getUserInfo(entry)
                let currentUserInfo = await getUserInfo(currentUser)

                console.log(currentUser.id)
                console.log(entry.id)

                let movieInfo = {"user_1" : currentUserInfo.movies, "user_2" : matchInfo.movies}
                let showInfo = {"user_1" : currentUserInfo.shows, "user_2" : matchInfo.shows}
                let hobbiesInfo = {"user_1" : currentUserInfo.hobbies, "user_2" : matchInfo.hobbies}
                let tagsInfo = {"user_1" : currentUserInfo.tags, "user_2" : matchInfo.tags}
                let matchScore = getScore(movieInfo, showInfo, hobbiesInfo, tagsInfo) 

                //check if match is already in database
                const matchQuery = new Parse.Query(Match);
                matchQuery.equalTo("user_1", currentUser.id);
                matchQuery.equalTo("user_2", entry.id);
                let matchResults = await matchQuery.find();

                if(matchResults.length > 0){
                    for(let i = 0; i < matchResults.length; i++){
                        //update match score if needed
                        matchResults[i].set("score", matchScore)
                        if(params.match == matchResults[i].id && params.liked){
                            console.log("match liked")
                            matchResults[i].set("liked", params.liked)
                        }
                        await matchResults[i].save()
                    }
                }
                else{
                    const match = new Match();
                    match.set("score", matchScore)
                    match.set("liked", false)
                    match.set("seen", false)
                    match.set("user_1", currentUser.id)
                    match.set("user_2", entry.id)
                    await match.save()
                }
            }
            res.send({entries: entries, matchMessage : "Matches created", typeStatus : 'success'})
        }
        else{
            res.send({matchMessage : "Can't get current user", typeStatus : 'danger'})
        }
    }
    catch(error){
        res.send({matchMessage : error.message, typeStatus : 'danger'})
    }
})

app.get('/getMatch', async(req, res) => {
    Parse.User.enableUnsafeCurrentUser()
    let currentUser = Parse.User.current();
    const limit = req.query["limit"]
    const offset = req.query["offset"]
    if(currentUser){
        const Match = Parse.Object.extend("Match");
        const matchQuery = new Parse.Query(Match);
        matchQuery.equalTo("user_1", currentUser.id);
        matchQuery.descending("score")
        matchQuery.limit(parseInt(limit))
        matchQuery.skip(parseInt(offset))

        let match_results = await matchQuery.find();
        let users_info = []
        let score_info = []
        
        for(let i = 0; i < match_results.length; i++){
            let user_id = match_results[i].get('user_2')
            const query = new Parse.Query(Parse.User);
            query.equalTo("objectId", user_id);
            const userInfo = await query.first()
            users_info.push(userInfo)
            score_info.push({score: match_results[i].get('score'), liked: match_results[i].get('liked'), seen: match_results[i].get('seen')})
        }
        var matchesInfo = users_info.map(function(_, i) {
            return {
              userInfo: users_info[i],
              scoreInfo: score_info[i]
            };
          });
        res.send({limit : limit, offset : offset, matchesInfo : matchesInfo, matchResults : match_results, matchMessage: "Matches Retrieved!", typeStatus: "success"});
    }
    else{
        res.send({matchMessage: "Can't get current user", typeStatus: "danger"});
    }
  });

app.post('/verify', async(req, res) => {
    Parse.User.enableUnsafeCurrentUser()
    let infoUser = req.body

    try{
        let currentUser = Parse.User.current();
        if (currentUser) {
            currentUser.set("firstName", infoUser.firstName)
            currentUser.set("lastName", infoUser.lastName)
            currentUser.set("university", infoUser.university)
            currentUser.set("DOB", infoUser.dob)
            await currentUser.save()
            res.send({userInfo: currentUser, verifyMessage: "User verified!", typeStatus: "success",  infoUser: infoUser});
        } else {
            res.send({verifyMessage: "Can't get current user", typeStatus: "danger",  infoUser: infoUser});
        }
      } catch (error){
        res.send({verifyMessage: error.message, typeStatus: "danger",  infoUser: infoUser});
      }
})

app.post('/user/interests/remove', async(req, res) => {
    let removeInfo = req.body
    Parse.User.enableUnsafeCurrentUser()
    let currentUser = Parse.User.current();
    try{
        if(currentUser){
            if(removeInfo.movie){
                const Movie = Parse.Object.extend("Movie");
                const query = new Parse.Query(Movie);
                query.equalTo("api_id", removeInfo.movie.api_id);
                query.equalTo("User", currentUser);
                const entry = await query.find();
                entry[0].set("active", false)
                await entry[0].save()
            }
            if(removeInfo.show){
                const Show = Parse.Object.extend("Show");
                const query = new Parse.Query(Show);
                query.equalTo("api_id", removeInfo.show.api_id);
                query.equalTo("User", currentUser);
                const entry = await query.find();
                entry[0].set("active", false)
                await entry[0].save()
            }
            if(removeInfo.hobby){
                const Hobby = Parse.Object.extend("Hobby");
                const query = new Parse.Query(Hobby);
                query.equalTo("name", removeInfo.hobby.name);
                query.equalTo("User", currentUser);
                const entry = await query.find();
                entry[0].set("active", false)
                await entry[0].save()
            }
            res.send({removeMessage: "success", removeInfo : removeInfo, entry: entry[0]});
        }
        else{
            res.send({removeMessage: "Can't get current user", typeStatus: "danger"});
        }
    }
    catch (error){
        res.send({removeMessage: error.message, typeStatus: "danger"});
      }
  });

app.get('/user/interests', async(req, res) => {
    Parse.User.enableUnsafeCurrentUser()
    let currentUser = Parse.User.current();
    if(currentUser){
        const Movie = Parse.Object.extend("Movie");
        const movieQuery = new Parse.Query(Movie);

        movieQuery.equalTo("User", currentUser);
        movieQuery.equalTo("active", true);
        // now contains the movies for this user
        const userMovies = await movieQuery.find();

        const Show = Parse.Object.extend("Show");
        const showQuery = new Parse.Query(Show);
        showQuery.equalTo("User", currentUser);
        showQuery.equalTo("active", true);
        // now contains the shows for this user
        const userShows = await showQuery.find();

        const Hobby = Parse.Object.extend("Hobby");
        const hobbyQuery = new Parse.Query(Hobby);
        hobbyQuery.equalTo("User", currentUser);
        hobbyQuery.equalTo("active", true);
        // now contains the hobbies for this user
        const userHobbies = await hobbyQuery.find();

        let rawdata = fs.readFileSync('data/hobbies.json');
        let hobbies = JSON.parse(rawdata);

        res.send({movies : userMovies, shows : userShows, hobbies : userHobbies, hobbiesList : hobbies.hobbies, getInterestsMessage: "Interests Retreived", typeStatus: "success"});
    }
    else{
        res.send({getInterestsMessage: "Can't get current user", typeStatus: "danger"});
    }
  });

app.post('/user/interests', async(req, res) => {
    Parse.User.enableUnsafeCurrentUser()
    let infoInterests = req.body

    try{
        const Movie = Parse.Object.extend("Movie");
        const movie = new Movie();

        const Show = Parse.Object.extend("Show");
        const show = new Show();

        const Hobby = Parse.Object.extend("Hobby");
        const hobby = new Hobby();

        let currentUser = Parse.User.current();
        if (currentUser) {
            if(infoInterests.interests.movie && infoInterests.interests.movie !=""){
                const query = new Parse.Query(Movie);
                query.equalTo("User", currentUser);
                query.equalTo("api_id", infoInterests.interests.movie.id);
                const entries = await query.find();
                if(entries && entries[0]){
                    console.log("entries", entries)
                    console.log('duplicate')
                    if(!entries[0].active){
                        entries[0].set("active", true)
                    }
                    await entries[0].save()
                }
                else{
                    movie.set("title", infoInterests.interests.movie.title)
                    movie.set("api_id", infoInterests.interests.movie.id)
                    movie.set("genres", infoInterests.interests.movie.genre_ids)
                    movie.set("user", currentUser.id)
                    movie.set("active", true)
                    let usersRelation = movie.relation('User');
                    usersRelation.add(currentUser)
                    await movie.save()
                }
            }
            if(infoInterests.interests.TV && infoInterests.interests.TV != ""){
                const query = new Parse.Query(Show);
                query.equalTo("User", currentUser);
                query.equalTo("api_id", infoInterests.interests.TV.id);
                const entries = await query.find();
                if(entries && entries[0]){
                    console.log("entries", entries)
                    console.log('duplicate')
                    if(!entries[0].active){
                        entries[0].set("active", true)
                    }
                    await entries[0].save()
                }
                else{
                    show.set("title", infoInterests.interests.TV.name)
                    show.set("api_id", infoInterests.interests.TV.id)
                    show.set("genres", infoInterests.interests.TV.genre_ids)
                    show.set("user", currentUser.objectId)
                    show.set("active", true)
                    let usersRelation = show.relation('User');
                    usersRelation.add(currentUser)
                    await show.save()
                }
            }
            if(infoInterests.interests.hobby){
                const query = new Parse.Query(Hobby);
                query.equalTo("User", currentUser);
                query.equalTo("name", infoInterests.interests.hobby.name);
                const entries = await query.find();
                if(entries && entries[0]){
                    console.log("entries", entries)
                    console.log('duplicate')
                    if(!entries[0].active){
                        entries[0].set("active", true)
                    }
                    await entries[0].save()
                }
                else{
                    hobby.set("name", infoInterests.interests.hobby.name)
                    hobby.set("category", infoInterests.interests.hobby.category)
                    hobby.set("active", true)
                    let usersRelation = hobby.relation('User');
                    usersRelation.add(currentUser)
                    await hobby.save()
                }
            }
            res.send({hobby : hobby, show : show, movie : movie, userInfo: currentUser, interestsMessage: "User interests info saved!", typeStatus: "success",  infoInterests : infoInterests});
        } else {
            res.send({hobby : hobby, show : show, movie : movie, userInfo: "", interestsMessage: "Can't get current user", typeStatus: "danger",  infoInterests: infoInterests});
        }
      } catch (error){
        res.send({interestsMessage: error.message, typeStatus: "danger",  infoInterests : infoInterests});
      }
})

app.post('/user/basic', async(req, res) => {
    Parse.User.enableUnsafeCurrentUser()
    let infoUser = req.body

    try{
        let currentUser = Parse.User.current();
        if (currentUser) {
            if(infoUser.year && infoUser.year != ""){
                currentUser.set("grad_year", infoUser.year)
            }
            if(infoUser.major && infoUser.major != ""){
                currentUser.set("major", infoUser.major)
            }
            if(infoUser.hometown && infoUser.hometown != ""){
                currentUser.set("hometown", infoUser.hometown)
            }
            if(infoUser.profile_photo && infoUser.profile_photo != ""){
                currentUser.set("profile_photo", infoUser.profile_photo)
            }
            if(infoUser.tags){
                console.log("tags",infoUser.tags)
                currentUser.set("tags", infoUser.tags)
            }
            if(infoUser.media){
                currentUser.set("media", infoUser.media)
            }
            await currentUser.save()
            res.send({userInfo: currentUser, saveInfoMessage: "User basic info saved!", typeStatus: "success",  infoUser: infoUser});
        } else {
            res.send({userInfo: "", saveInfoMessage: "Can't get current user",  typeStatus: "danger",  infoUser: infoUser});
        }
      } catch (error){
        res.send({saveInfoMessage: error.message, typeStatus: "danger",  infoUser: infoUser});
      }
})
module.exports = app;