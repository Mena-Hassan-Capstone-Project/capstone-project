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
var cors = require('cors')

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
    var matches = 0
    for (var i = 0; i < arr_1.length; i++) {
        if (arr_2.indexOf(arr_1[i]) != -1)
            matches++;
    }
    return (matches / (arr_1.length + arr_2.length)) * weight
}

function getScore(movies, shows, hobbies, tags){
    //get movie genre matches
    var user1_genres = []
    var user1_movies = []
    for (var i = 0; i < movies.user_1.length; i++) {
        user1_genres = user1_genres.concat(movies.user_1[i].genres)
        user1_movies.push(movies.user_1[i].title)
    }
    var user2_genres = []
    var user2_movies = []
    for (var i = 0; i < movies.user_2.length; i++) {
        user2_genres = user2_genres.concat(movies.user_2[i].genres)
        user2_movies.push(movies.user_2[i].title)
    }
    var movieGenreScore = compareArrs(user1_genres, user2_genres, 0.2)
    var movieTitleScore = compareArrs(user1_movies, user2_movies, 0.05)

    //get tv genre matches
    var user1_show_genres = []
    var user1_shows = []
    for (var i = 0; i < shows.user_1.length; i++) {
        user1_show_genres = user1_show_genres.concat(shows.user_1[i].genres)
        user1_shows.push(shows.user_1[i].title)
    }
    var user2_show_genres = []
    var user2_shows = []
    for (var i = 0; i < shows.user_2.length; i++) {
        user2_show_genres = user2_show_genres.concat(shows.user_2[i].genres)
        user2_shows.push(shows.user_2[i].title)
    }
    var showGenreScore = compareArrs(user1_show_genres, user2_show_genres, 0.2)
    var showTitleScore = compareArrs(user1_shows, user2_shows, 0.05)

    //get hobby matches
    var user1_hobby_categories = []
    var user1_hobbies = []
    for (var i = 0; i < hobbies.user_1.length; i++) {
        user1_hobby_categories.push(hobbies.user_1[i].category)
        user1_hobbies.push(hobbies.user_1[i].name)
    }
    var user2_hobby_categories = []
    var user2_hobbies = []
    for (var i = 0; i < hobbies.user_2.length; i++) {
        user2_hobby_categories.push(hobbies.user_2[i].category)
        user2_hobbies.push(hobbies.user_2[i].name)
    }
    var hobbyCategoryScore = compareArrs(user1_hobby_categories, user2_hobby_categories, 0.25)
    var hobbyScore = compareArrs(user1_hobbies, user2_hobbies, 0.1)

    var tagsScore = compareArrs(tags.user_1, tags.user_2, 0.15)
    return (movieGenreScore + movieTitleScore + showGenreScore + showTitleScore + hobbyCategoryScore + hobbyScore + tagsScore)
}

app.post('/login', async(req, res) => {
    let infoUser = req.body

    try{
        let user = await Parse.User.logIn(infoUser.email, infoUser.password)
        res.send({userInfo : user, loginMessage: "User logged in!", RegisterMessage: '', typeStatus: "success",  infoUser: infoUser});
      } catch (error){
        res.send({loginMessage: error.message, RegisterMessage: '', typeStatus: "danger",  infoUser: infoUser});
      }
})

app.post('/logout', async(req, res) => {

    try{
        await Parse.User.logOut()
        res.send({logoutMessage: "User logged out!", RegisterMessage: '', typeStatus: "success"});
      } catch (error){
        res.send({logoutMessage: error.message, RegisterMessage: '', typeStatus: "danger"});
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
        res.send({loginMessage : "User signed up!", RegisterMessage: '', typeStatus : 'success', infoUser : infoUser})
        let userLogin = await Parse.User.logIn(infoUser.email, infoUser.password)
    }
    catch(error){
        res.send({loginMessage : error.message, RegisterMessage: '', typeStatus : 'danger', infoUser : infoUser})
    }
})

app.post('/getMatch', async(req, res) => {
    Parse.User.enableUnsafeCurrentUser()
    let infoUser = req.body
    let currentUser = Parse.User.current();
    try{
        if(currentUser){
            const query = new Parse.Query(Parse.User);
            query.notEqualTo("objectId", currentUser.id);
            const entries = await query.find()
            const Match = Parse.Object.extend("match");
            var count = 0

            console.log("entries", entries.length)
            for (var i = 0; i < entries.length; i++){
                var matches = []
                var entry = entries[i]
                console.log("entry", entry.objectId)
                console.log("count", count)
                var matchInfo = await getUserInfo(entry)
                //console.log("matchInfo", matchInfo)
                var currentUserInfo = await getUserInfo(currentUser)
                //console.log("currentUserInfo", currentUserInfo)
                var movieInfo = {"user_1" : matchInfo.movies, "user_2" : currentUserInfo.movies}
                var showInfo = {"user_1" : matchInfo.shows, "user_2" : currentUserInfo.shows}
                var hobbiesInfo = {"user_1" : matchInfo.hobbies, "user_2" : currentUserInfo.hobbies}
                var tagsInfo = {"user_1" : matchInfo.tags, "user_2" : currentUserInfo.tags}
                var matchScore = getScore(movieInfo, showInfo, hobbiesInfo, tagsInfo)                

                //check if match is already in database and has not been liked
                const matchQuery = new Parse.Query(Match);
                matchQuery.equalTo("User", entry);
                matchQuery.equalTo("User", currentUser);
                var result = await matchQuery.find();
                console.log("results length", result.length)
                var results = result[0]
                if(results){
                    //update score
                    results.set("score", matchScore)
                    console.log("matchScore - already matched", matchScore)
                    await results.save()
                    console.log('matchScore Saved')
                    matches.push(results)
                }
                else{
                    const match = new Match();
                    match.set("score", matchScore)
                    console.log("matchScore - new match", matchScore)
                    match.set("liked", false)
                    match.set("user1_id",entry.objectId)
                    let userRelation = match.relation('User');
                    userRelation.add([entry, currentUser])
                    await match.save()
                    console.log('match Saved')
                    matches.push(match)
                }
                count++;
                console.log("end of loop")
            }
            res.send({matches : matches, matchScore : matchScore, entries: entries, loginMessage : "Matches retrieved", typeStatus : 'success', infoUser : infoUser})
        }
        else{
            res.send({loginMessage : "Can't get current user", RegisterMessage: '', typeStatus : 'danger', infoUser : infoUser})
        }
    }
    catch(error){
        res.send({loginMessage : error.message, RegisterMessage: '', typeStatus : 'danger', infoUser : infoUser})
    }
})

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
            res.send({userInfo: currentUser, loginMessage: "User verified!", RegisterMessage: '', typeStatus: "success",  infoUser: infoUser});
        } else {
            res.send({loginMessage: "Can't get current user", RegisterMessage: '', typeStatus: "danger",  infoUser: infoUser});
        }
      } catch (error){
        res.send({loginMessage: error.message, RegisterMessage: '', typeStatus: "danger",  infoUser: infoUser});
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
            res.send({removeMessage: "Can't get current user", RegisterMessage: '', typeStatus: "danger"});
        }
    }
    catch (error){
        res.send({loginMessage: error.message, RegisterMessage: '', typeStatus: "danger"});
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
        // comments now contains the movies for this user
        const userMovies = await movieQuery.find();

        const Show = Parse.Object.extend("Show");
        const showQuery = new Parse.Query(Show);
        showQuery.equalTo("User", currentUser);
        showQuery.equalTo("active", true);
        // comments now contains the movies for this user
        const userShows = await showQuery.find();

        const Hobby = Parse.Object.extend("Hobby");
        const hobbyQuery = new Parse.Query(Hobby);
        hobbyQuery.equalTo("User", currentUser);
        hobbyQuery.equalTo("active", true);
        // comments now contains the movies for this user
        const userHobbies = await hobbyQuery.find();

        let rawdata = fs.readFileSync('data/hobbies.json');
        let hobbies = JSON.parse(rawdata);

        res.send({movies : userMovies, shows : userShows, hobbies : userHobbies, hobbiesList : hobbies.hobbies});
    }
    else{
        res.send({loginMessage: "Can't get current user", RegisterMessage: '', typeStatus: "danger"});
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
                    movie.set("user", currentUser.objectId)
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
            res.send({hobby : hobby, show : show, movie : movie, userInfo: currentUser, loginMessage: "User interests info saved!", RegisterMessage: '', typeStatus: "success",  infoInterests : infoInterests});
        } else {
            res.send({hobby : hobby, show : show, movie : movie, userInfo: "", loginMessage: "Can't get current user", RegisterMessage: '', typeStatus: "danger",  infoInterests: infoInterests});
        }
      } catch (error){
        res.send({loginMessage: error.message, RegisterMessage: '', typeStatus: "danger",  infoInterests : infoInterests});
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
                let img_data = infoUser.media;
                currentUser.set("media", img_data)
            }
            await currentUser.save()
            res.send({userInfo: currentUser, loginMessage: "User basic info saved!", RegisterMessage: '', typeStatus: "success",  infoUser: infoUser});
        } else {
            res.send({userInfo: "", loginMessage: "Can't get current user", RegisterMessage: '', typeStatus: "danger",  infoUser: infoUser});
        }
      } catch (error){
        res.send({loginMessage: error.message, RegisterMessage: '', typeStatus: "danger",  infoUser: infoUser});
      }
})
module.exports = app;