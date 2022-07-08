const Parse = require('parse/node')
const express = require('express')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const app = express()
app.use(bodyParser.json())
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

app.post('/user/basic', async(req, res) => {
    Parse.User.enableUnsafeCurrentUser()
    let infoUser = req.body

    try{
        let currentUser = Parse.User.current();
        console.log("hello")
        if (currentUser) {
            console.log("photo name", infoUser.profile_photo)
            if(infoUser.year != ""){
                currentUser.set("grad_year", infoUser.year)
            }
            if(infoUser.major != ""){
                currentUser.set("major", infoUser.major)
            }
            if(infoUser.hometown != ""){
                currentUser.set("hometown", infoUser.hometown)
            }
            if(infoUser.profile_photo != ""){
                console.log("profile_pic", {"name" : infoUser.profile_photo})
                currentUser.set("profile_pic", {"name" : infoUser.profile_photo})
            }
            else{
                console.log("no profile photo")
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