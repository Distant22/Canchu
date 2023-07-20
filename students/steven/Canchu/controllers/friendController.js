const friendModel = require('../models/friendModel')

module.exports = {
    postRequest: async(req,res) => {
        const user_id = req.params.user_id
        await friendModel.postRequest(res,user_id,req.user.id)
    },
    getFriends: async(req,res) => {
        const id = req.user.id
        await friendModel.getFriends(res,id)
    },
    getPending: async(req,res) => {
        const id = req.user.id
        await friendModel.getPending(res,id)
    },
    postAgree: async(req,res) => {
        const id = req.params.friendship_id
        await friendModel.postAgree(res,id,req.user.id)
    },
    deleteFriend: async(req,res) => {
        const id = req.params.friendship_id
	console.log(req.params,"為刪朋友的參數")
        await friendModel.deleteFriend(res,id,req.user.id)
    }
}
