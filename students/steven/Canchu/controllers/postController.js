const postModel = require('../models/postModel')

module.exports = {
    createPost: async(req,res) => {
        const { context } = req.body;
        const id = req.user.id
        await postModel.createPost(res,id,context)
    },
    createLike: async(req,res) => {
        const id = req.user.id
        const post_id = req.params.id
        await postModel.createLike(res,id,post_id)
    },
    createComment: async(req,res) => {
        const { content } = req.body;
        const id = req.user.id
        const post_id = req.params.id
        await postModel.createComment(res,id,post_id,content)
    },
    deleteLike: async(req,res) => {
        const id = req.user.id
        const post_id = req.params.id
        await postModel.deleteLike(res,id,post_id)
    },
    updatePost: async(req,res) => {
        const { context } = req.body;
        const id = req.user.id
        const post_id = req.params.id
        await postModel.updatePost(res,id,post_id,context)
    },
    getDetail: async(req,res) => {
        const post_id = req.params.id
        await postModel.getDetail(res,post_id)
    },
    getSearch: async(req,res) => {
        const { user_id, cursor } = req.query
        console.log('controller測試：',user_id,cursor)
        await postModel.getSearch(res,user_id, cursor)
    },
}