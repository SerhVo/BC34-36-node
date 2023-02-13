const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const {User} = require("../models/user");

const { HttpError, ctrlWrapper } = require("../helpers");

const {SECRET_KEY} = process.env;

const register = async(req, res)=> {
    const {email, name, password} = req.body;
    const user = await User.findOne({email});
    if(user) {
        throw HttpError(409, `${email} is already exist`)
    }
    
    const hashPassword = await bcrypt.hash(password, 10);

    const result = await User.create({name, email, password: hashPassword});

    res.json({
        email: result.email,
        name: result.name,
    })
}

const login = async(req, res) => {
    const {email, password} = req.body;
    const user = await User.findOne({email});
    if(!user) {
        throw HttpError(401, "Email or password invalid"); // throw HttpError(401, "Email invalid");
    }

    const passwordCompare = await bcrypt.compare(password, user.password);
    if(!passwordCompare) {
        throw HttpError(401, "Email or password invalid"); // throw HttpError(401, "Password invalid");
    }

    const payload = {
        id: user._id,
    }

    const token = jwt.sign(payload, SECRET_KEY, {expiresIn: "23h"});

    res.json({
        token,
    })
}

module.exports = {
    register: ctrlWrapper(register),
    login: ctrlWrapper(login),
}