const mysql = require('mysql');
const express = require('express')
const app = express()
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const friendModel = require('../models/friendModel')
const util = require('../utils/util')

module.exports = {
    postRequest: async(req,res) => {
        const user_id = req.params.user_id
        await friendModel.postRequest(res,user_id,req.user.id)
    },
    getPending: async(req,res) => {
        const id = req.user.id
        await friendModel.getPending(res,id)
    }
}