const Parse = require('parse/node')
const express = require('express')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const app = express()
var cors = require('cors')

app.use(cors())
app.use(bodyParser.json())
app.use(morgan('tiny'))

Parse.initialize('78hKdRq48OxfwlPbCkgFfgfquxCqwLiK86y3bjLU', '76IvY9V2pEqghFHqV3mZf8xhcUaPL6WndGCJbGhc')
Parse.serverURL = 'http://parseapi.back4app.com/'

app.post('/login', async(req, res) => {
    let infoUser = req.body
    let user = new Parse.User()

    user.set("username", infoUser.email)
    user.set("email", infoUser.email)
    user.set("password", infoUser.password)

    try{
        await user.signUp()
        res.send({loginMessage : "User logged in!", RegisterMessage: '', typeStatus : 'success', infoUser : infoUser})
    }
    catch(error){
        res.send({loginMessage : error.message, RegisterMessage: '', typeStatus : 'danger', infoUser : infoUser})
    }
})

module.exports = app;
