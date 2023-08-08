const groupModel = require('../models/groupModel')

module.exports = {
    createGroup: async(req,res) => {
        const id = req.user.id
        const { name } = req.body;
        await groupModel.createGroup(res,id,name)
    },
    deleteGroup: async(req,res) => {
        const user_id = req.user.id
        const id = req.params.id;
        await groupModel.deleteGroup(res,user_id,id)
    },
    joinGroup: async(req,res) => {
        const group_id = req.params.group_id;
        const id = req.user.id
        await groupModel.joinGroup(res,id,group_id)
    },
    postGroup: async(req,res) => {
        const group_id = req.params.group_id;
        const id = req.user.id
        const { context } = req.body;
        await groupModel.postGroup(res,id,group_id,context)
    },
    getPending: async(req,res) => {
        const group_id = req.params.group_id;
        const id = req.user.id;
        await groupModel.getPending(res,id,group_id)
    },
    agreeJoin: async(req,res) => {
        const group_id = req.params.group_id;
        const user_id = req.params.user_id;
        const id = req.user.id
        await groupModel.agreeJoin(res,id,user_id,group_id)
    },
    search: async(req,res) => {
        const group_id = req.params.group_id;
        const id = req.user.id
        await groupModel.search(res,id,group_id)
    },
}