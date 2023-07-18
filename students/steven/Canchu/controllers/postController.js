const postModel = require('../models/postModel')

module.exports = {
    createPost: async(req,res) => {
        const { context } = req.body;
        const id = req.user.id
        console.log("現在操作createPost｜參數：",id,context);
        await postModel.createPost(res,id,context)
    },
    createLike: async(req,res) => {
        const id = req.user.id
        const post_id = req.params.id
        console.log("現在操作createLike｜參數：",id,post_id);
        await postModel.createLike(res,id,post_id)
    },
    createComment: async(req,res) => {
        const { content } = req.body;
        const id = req.user.id
        const post_id = req.params.id
        console.log("現在操作createComment｜參數：",id,post_id,content);
        await postModel.createComment(res,id,post_id,content)
    },
    deleteLike: async(req,res) => {
        const id = req.user.id
        const post_id = req.params.id
        console.log("現在操作deleteLike｜參數：",id,post_id);
        await postModel.deleteLike(res,id,post_id)
    },
    updatePost: async(req,res) => {
        const { context } = req.body;
        const id = req.user.id
        const post_id = req.params.id
        console.log("現在操作updatePost｜參數：",id,post_id,context);
        await postModel.updatePost(res,id,post_id,context)
    },
    getDetail: async(req,res) => {
        const post_id = req.params.id
        console.log("現在操作getDetail｜參數：",post_id);
        await postModel.getDetail(res,post_id)
    },
    getSearch: async(req,res) => {
        const { user_id, cursor } = req.query
        console.log("現在操作getSearch｜參數：",req.user.id,user_id, cursor);
        await postModel.getSearch(res,req.user.id,user_id, cursor)
    },
}