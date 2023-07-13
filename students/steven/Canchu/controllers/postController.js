const postModel = require('../models/postModel')

module.exports = {
    createPost: async(req,res) => {
        const { context } = req.body;
        const id = req.user.id
        await postModel.createPost(res,id,context)
    },
    updatePost: async(req,res) => {
        const { context } = req.body;
        const id = req.user.id
        const post_id = req.params.id
        await postModel.updatePost(res,id,post_id,context)
    }
}