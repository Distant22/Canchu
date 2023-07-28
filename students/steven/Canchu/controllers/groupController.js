const groupModel = require('../models/groupModel')

module.exports = {
    createGroup: async(req,res) => {
        const id = req.user.id
        const { name } = req.body;
        if (!name) { 
            return res.status(400).json({ error: `There's no name.` });
        }
        await groupModel.createGroup(res,id,name)
    },
    deleteGroup: async(req,res) => {
        const user_id = req.user.id
        const id = req.params.id;
        if (!id) { 
            return res.status(400).json({ error: `There's no id.` });
        }
        await groupModel.deleteGroup(res,user_id,id)
    },
    joinGroup: async(req,res) => {
        const group_id = req.params.group_id;
        const id = req.user.id
        if (!group_id) { 
            return res.status(400).json({ error: `There's no id.` });
        }
        await groupModel.joinGroup(res,id,group_id)
    },
    getPending: async(req,res) => {
        const group_id = req.params.group_id;
        const id = req.params.id;
        if (!group_id) { 
            return res.status(400).json({ error: `There's no id.` });
        }
        await groupModel.getPending(res,id,group_id)
    }
}