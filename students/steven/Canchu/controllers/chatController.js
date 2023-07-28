const chatModel = require('../models/chatModel')

module.exports = {
    sendMessage: async(req,res) => {
        const id = req.user.id
        const user_id = req.params.user_id
        const { message } = req.body;
        await chatModel.sendMessage(res,id,user_id,message)
    },
    search: async(req,res) => {
        const { cursor } = req.query
        const user_id = req.params.user_id
        const id = req.user.id
        await chatModel.search(res,id,user_id,cursor)
    }
}