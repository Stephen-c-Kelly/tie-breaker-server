import jwt from "jsonwebtoken";
import User from '../model/user.js'
import Profile from "../model/profile.js";
import bcrypt from 'bcrypt'
import 'dotenv/config'

const SECRET = process.env.SECRET

function createJWT(user){
    return jwt.sign(
        {user}, // data payload
        SECRET,
        { expiresIn: '1h'}
    )
}

async function signUp(req, res){
    User.findOne({email:req.body.email})
    .then(user => {
        if (user) {
            throw new Error('Account already exists')
        }else if (!process.env.SECRET){
            throw new Error('no SECRET in .env file')
          }else{
            Profile.create(req.body)
            .then(profile => {
                req.body.profileId = profile._id
                User.create(req.body)
                .then( user => {
                    // const token = createJWT(user)
                    res.status(200).send({ user })
                })
                .catch( error => {
                    Profile.findByIdAndDelete(profile._id)
                    res.status(500).send({
                        userCreateError: `${error}`
                    })

                })
            })
            .catch(error => {
                res.status(500).send({
                    profileCreateError: `${error}`
                })
            })
          }
    })
    .catch(err => {
        res.status(500).json({signUpError: err.message})
    })
    
}

function signIn(req, res){
    User.findOne({email: req.body.email})
    .then( user => {
        if (!user) return res.status(400).send({error:'User not found'})
        user.comparePassword(req.body.password, (err, isMatch) => {
            if (isMatch){
                const token = createJWT(user)
                res.json({token})
            } else {
                res.status(401).json({ err: 'Incorrect password' })
              }
        })
    })
    .catch(error => {
        res.status(500).send({
            signInError: `${error}`
        })
    })
}



export { signUp, signIn }