const Parse = require('parse/node')
const express = require('express')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const app = express()
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(express.json());
app.use(morgan('tiny'))
var cors = require('cors')

app.use(cors())

Parse.initialize('78hKdRq48OxfwlPbCkgFfgfquxCqwLiK86y3bjLU', '76IvY9V2pEqghFHqV3mZf8xhcUaPL6WndGCJbGhc')
Parse.serverURL = 'http://parseapi.back4app.com/'

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
            const Movie = Parse.Object.extend("Movie");
            const query = new Parse.Query(Movie);
            query.equalTo("title", removeInfo.movie.title);
            query.equalTo("User", currentUser);
            const entry = await query.find();
            entry[0].set("active", false)
            await entry[0].save()
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
        const query = new Parse.Query(Movie);
        query.equalTo("User", currentUser);
        query.equalTo("active", true);
        // comments now contains the movies for this user
        const users = await query.find();
        res.send(users);
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

        let currentUser = Parse.User.current();
        if (currentUser) {
            if(infoInterests.interests.movie){
                const query = new Parse.Query(Movie);
                query.equalTo("User", currentUser);
                query.equalTo("title", infoInterests.interests.movie.title);
                const entries = await query.find();
                if(entries && entries[0]){
                    console.log("entries", entries)
                    console.log('duplicate')
                    if(!entries[0].active){
                        entries[0].set("active", true)
                    }
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
            res.send({movie : movie, userInfo: currentUser, loginMessage: "User interests info saved!", RegisterMessage: '', typeStatus: "success",  infoInterests : infoInterests});
        } else {
            res.send({movie : movie, userInfo: "", loginMessage: "Can't get current user", RegisterMessage: '', typeStatus: "danger",  infoInterests: infoInterests});
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
            if(infoUser.tags && infoUser.tags != ""){
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