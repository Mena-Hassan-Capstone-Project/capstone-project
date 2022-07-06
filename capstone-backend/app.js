const Parse = require('parse/node')
const express = require('express')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const app = express()
app.use(bodyParser.json())
app.use(morgan('tiny'))
var cors = require('cors')
const { User } = require('parse/node')

app.use(cors())

Parse.initialize('78hKdRq48OxfwlPbCkgFfgfquxCqwLiK86y3bjLU', '76IvY9V2pEqghFHqV3mZf8xhcUaPL6WndGCJbGhc')
Parse.serverURL = 'http://parseapi.back4app.com/'

app.post('/login', async(req, res) => {
    let infoUser = req.body

    try{
        let user = await Parse.User.logIn(infoUser.email, infoUser.password)
        res.send({user : user, loginMessage: "User logged in!", RegisterMessage: '', typeStatus: "success",  infoUser: infoUser});
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
            res.send({loginMessage: "User verified!", RegisterMessage: '', typeStatus: "success",  infoUser: infoUser});
        } else {
            res.send({loginMessage: "Can't get current user", RegisterMessage: '', typeStatus: "success",  infoUser: infoUser});
        }
      } catch (error){
        res.send({loginMessage: error.message, RegisterMessage: '', typeStatus: "danger",  infoUser: infoUser});
      }
})


module.exports = app;
