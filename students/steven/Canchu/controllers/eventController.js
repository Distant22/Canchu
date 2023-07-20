const eventModel = require('../models/eventModel')

module.exports = {
    getEvent: async(req,res) => {
        const id = req.user.id
        await eventModel.getEvent(res,id)
    },
    readEvent: async(req,res) => {
        const id = req.user.id
        const event_id = req.params.event_id
        await eventModel.readEvent(res,id,event_id)
    }
}