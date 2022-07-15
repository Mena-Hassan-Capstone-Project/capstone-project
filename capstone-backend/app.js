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
    const movie_query = new Parse.Query(Movie);

    movie_query.equalTo("User", user);
    movie_query.equalTo("active", true);
    const user_movies = await movie_query.find();

    const Show = Parse.Object.extend("Show");
    const show_query = new Parse.Query(Show);
    show_query.equalTo("User", user);
    show_query.equalTo("active", true);
    const user_shows = await show_query.find();

    const Hobby = Parse.Object.extend("Hobby");
    const hobby_query = new Parse.Query(Hobby);
    hobby_query.equalTo("User", user);
    hobby_query.equalTo("active", true);
    const user_hobbies = await hobby_query.find();
    return({movies : user_movies, shows : user_shows, hobbies : user_hobbies, tags : user.get("tags")});
}

function compare_arrs(arr_1, arr_2, weight){
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
    let user1_genres = []
    let user1_movies = []
    for (let i = 0; i < movies.user_1.length; i++) {
        user1_genres = user1_genres.concat(movies.user_1[i].get('genres'))
        user1_movies.push(movies.user_1[i].get('title'))
    }
    let user2_genres = []
    let user2_movies = []
    for (let i = 0; i < movies.user_2.length; i++) {
        user2_genres = user2_genres.concat(movies.user_2[i].get('genres'))
        user2_movies.push(movies.user_2[i].get('title'))
    }
    let movie_genre_score = compare_arrs(user1_genres, user2_genres, 0.2)
    let movie_title_score = compare_arrs(user1_movies, user2_movies, 0.05)

    //get tv genre matches
    let user1_show_genres = []
    let user1_shows = []
    for (let i = 0; i < shows.user_1.length; i++) {
        user1_show_genres = user1_show_genres.concat(shows.user_1[i].get('genres'))
        user1_shows.push(shows.user_1[i].get('title'))
    }
    let user2_show_genres = []
    let user2_shows = []
    for (let i = 0; i < shows.user_2.length; i++) {
        user2_show_genres = user2_show_genres.concat(shows.user_2[i].get('genres'))
        user2_shows.push(shows.user_2[i].get('title'))
    }
    let show_genre_score = compare_arrs(user1_show_genres, user2_show_genres, 0.2)
    let show_title_score = compare_arrs(user1_shows, user2_shows, 0.05)

    //get hobby matches
    let user1_hobby_categories = []
    let user1_hobbies = []
    for (let i = 0; i < hobbies.user_1.length; i++) {
        user1_hobby_categories.push(hobbies.user_1[i].get('category'))
        user1_hobbies.push(hobbies.user_1[i].get('name'))
    }
    let user2_hobby_categories = []
    let user2_hobbies = []
    for (let i = 0; i < hobbies.user_2.length; i++) {
        user2_hobby_categories.push(hobbies.user_2[i].get('category'))
        user2_hobbies.push(hobbies.user_2[i].get('name'))
    }
    let hobby_category_score = compare_arrs(user1_hobby_categories, user2_hobby_categories, 0.25)
    let hobby_score = compare_arrs(user1_hobbies, user2_hobbies, 0.1)

    let tags_score = compare_arrs(tags.user_1, tags.user_2, 0.15)
    return (movie_genre_score + movie_title_score + show_genre_score + show_title_score + hobby_category_score + hobby_score + tags_score)
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
    let current_user = Parse.User.current();
    try{
        if(current_user){
            const query = new Parse.Query(Parse.User);
            query.notEqualTo("objectId", current_user.id);
            const entries = await query.find()
            const Match = Parse.Object.extend("Match");

            console.log("entries", entries.length)
            for (let i = 0; i < entries.length; i++){
                let entry = entries[i]
                let matchInfo = await getUserInfo(entry)
                let current_userInfo = await getUserInfo(current_user)

                console.log(current_user.id)
                console.log(entry.id)

                let movieInfo = {"user_1" : current_userInfo.movies, "user_2" : matchInfo.movies}
                let showInfo = {"user_1" : current_userInfo.shows, "user_2" : matchInfo.shows}
                let hobbiesInfo = {"user_1" : current_userInfo.hobbies, "user_2" : matchInfo.hobbies}
                let tagsInfo = {"user_1" : current_userInfo.tags, "user_2" : matchInfo.tags}
                let matchScore = getScore(movieInfo, showInfo, hobbiesInfo, tagsInfo) 

                //check if match is already in database
                //trying to filter results by whether two users are in the relational database
                const matchQuery = new Parse.Query(Match);
                matchQuery.equalTo("user_1", current_user.id);
                matchQuery.equalTo("user_2", entry.id);
                let matchResults = await matchQuery.find();

                if(matchResults.length > 0){
                    for(let i = 0; i < matchResults.length; i++){
                        //update match score if needed
                        matchResults[i].set("score", matchScore)
                        await matchResults[i].save()
                    }
                }
                else{
                    const match = new Match();
                    match.set("score", matchScore)
                    match.set("liked", false)
                    match.set("seen", false)
                    match.set("user_1", current_user.id)
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
    let current_user = Parse.User.current();
    const limit = req.query["limit"]
    const offset = req.query["offset"]
    if(current_user){
        const Match = Parse.Object.extend("Match");
        const matchQuery = new Parse.Query(Match);
        matchQuery.equalTo("user_1", current_user.id);
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
        let current_user = Parse.User.current();
        if (current_user) {
            current_user.set("firstName", infoUser.firstName)
            current_user.set("lastName", infoUser.lastName)
            current_user.set("university", infoUser.university)
            current_user.set("DOB", infoUser.dob)
            await current_user.save()
            res.send({userInfo: current_user, verifyMessage: "User verified!", typeStatus: "success",  infoUser: infoUser});
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
    let current_user = Parse.User.current();
    try{
        if(current_user){
            if(removeInfo.movie){
                const Movie = Parse.Object.extend("Movie");
                const query = new Parse.Query(Movie);
                query.equalTo("api_id", removeInfo.movie.api_id);
                query.equalTo("User", current_user);
                const entry = await query.find();
                entry[0].set("active", false)
                await entry[0].save()
            }
            if(removeInfo.show){
                const Show = Parse.Object.extend("Show");
                const query = new Parse.Query(Show);
                query.equalTo("api_id", removeInfo.show.api_id);
                query.equalTo("User", current_user);
                const entry = await query.find();
                entry[0].set("active", false)
                await entry[0].save()
            }
            if(removeInfo.hobby){
                const Hobby = Parse.Object.extend("Hobby");
                const query = new Parse.Query(Hobby);
                query.equalTo("name", removeInfo.hobby.name);
                query.equalTo("User", current_user);
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
    let current_user = Parse.User.current();
    if(current_user){
        const Movie = Parse.Object.extend("Movie");
        const movie_query = new Parse.Query(Movie);

        movie_query.equalTo("User", current_user);
        movie_query.equalTo("active", true);
        // now contains the movies for this user
        const user_movies = await movie_query.find();

        const Show = Parse.Object.extend("Show");
        const show_query = new Parse.Query(Show);
        show_query.equalTo("User", current_user);
        show_query.equalTo("active", true);
        // now contains the shows for this user
        const user_shows = await show_query.find();

        const Hobby = Parse.Object.extend("Hobby");
        const hobby_query = new Parse.Query(Hobby);
        hobby_query.equalTo("User", current_user);
        hobby_query.equalTo("active", true);
        // now contains the hobbies for this user
        const user_hobbies = await hobby_query.find();

        let rawdata = fs.readFileSync('data/hobbies.json');
        let hobbies = JSON.parse(rawdata);

        res.send({movies : user_movies, shows : user_shows, hobbies : user_hobbies, hobbiesList : hobbies.hobbies, getInterestsMessage: "Interests Retreived", typeStatus: "success"});
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

        let current_user = Parse.User.current();
        if (current_user) {
            if(infoInterests.interests.movie && infoInterests.interests.movie !=""){
                const query = new Parse.Query(Movie);
                query.equalTo("User", current_user);
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
                    movie.set("user", current_user.id)
                    movie.set("active", true)
                    let usersRelation = movie.relation('User');
                    usersRelation.add(current_user)
                    await movie.save()
                }
            }
            if(infoInterests.interests.TV && infoInterests.interests.TV != ""){
                const query = new Parse.Query(Show);
                query.equalTo("User", current_user);
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
                    show.set("user", current_user.objectId)
                    show.set("active", true)
                    let usersRelation = show.relation('User');
                    usersRelation.add(current_user)
                    await show.save()
                }
            }
            if(infoInterests.interests.hobby){
                const query = new Parse.Query(Hobby);
                query.equalTo("User", current_user);
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
                    usersRelation.add(current_user)
                    await hobby.save()
                }
            }
            res.send({hobby : hobby, show : show, movie : movie, userInfo: current_user, interestsMessage: "User interests info saved!", typeStatus: "success",  infoInterests : infoInterests});
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
        let current_user = Parse.User.current();
        if (current_user) {
            if(infoUser.year && infoUser.year != ""){
                current_user.set("grad_year", infoUser.year)
            }
            if(infoUser.major && infoUser.major != ""){
                current_user.set("major", infoUser.major)
            }
            if(infoUser.hometown && infoUser.hometown != ""){
                current_user.set("hometown", infoUser.hometown)
            }
            if(infoUser.profile_photo && infoUser.profile_photo != ""){
                current_user.set("profile_photo", infoUser.profile_photo)
            }
            if(infoUser.tags){
                console.log("tags",infoUser.tags)
                current_user.set("tags", infoUser.tags)
            }
            if(infoUser.media){
                let img_data = infoUser.media;
                current_user.set("media", img_data)
            }
            await current_user.save()
            res.send({userInfo: current_user, saveInfoMessage: "User basic info saved!", typeStatus: "success",  infoUser: infoUser});
        } else {
            res.send({userInfo: "", saveInfoMessage: "Can't get current user",  typeStatus: "danger",  infoUser: infoUser});
        }
      } catch (error){
        res.send({saveInfoMessage: error.message, typeStatus: "danger",  infoUser: infoUser});
      }
})
module.exports = app;