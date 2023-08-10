const userModel = require('../models/userModel')
const util = require('../utils/util')

module.exports = {
    signin: async (req, res) => {
        const { provider, email, password, access_token } = req.body;
        if(!provider){
            return res.status(400).json({ error: 'Provider is required' })
        }
        if (provider !== 'native' && provider !== 'facebook') {
            return res.status(403).json({ error: 'Invalid provider' });
          }
        if (provider == 'native' && (!email || !password)) {
            return res.status(400).json({ error: 'Email and password are required' });
          }
        if (provider === 'facebook' && !access_token) {
            return res.status(400).json({ error: 'Access token is required for Facebook login' });
          }
        if (provider === 'facebook') {
            await axios
                .get(`https://graph.facebook.com/v17.0/me?fields=id,name,email&access_token=${access_token}`)
                .then((response) => { 
                    const {id, name, email} = response.data;
                    const user = {
                        id,
                        provider,
                        name,
                        email,
                        picture: `https://graph.facebook.com/${id}/picture?type=large`,
                    };
                    const token = util.generateToken(user);
                    res.status(200).json({
                        data: {
                            access_token: token,
                            user: user,
                        },
                    });
                })
        } else {
            await userModel.signin(res,email,password,provider)
        }
    },

    signup: async (req, res) => {
        // Extract data from request body
        const { name, email, password } = req.body;
        // Perform validation
        if (!name || !email || !password) {    
            return res.status(400).json({ error: 'Missing required fields' });
        } else {
            const emailResult = util.emailValidate(email)
            if(!emailResult){
                return res.status(400).json({ error: 'Email format is incorrect' });
            }
            await userModel.signup(res,name,email,password)
        }
    },

    getProfile: async(req,res) => {
        const userId = req.params.id;
        await userModel.getProfile(res,userId,req.user.id)
    },

    updateProfile: async(req,res) => {
        const { name, introduction, tags } = req.body;
        const id = req.user.id;
        await userModel.updateProfile(res,name,introduction,tags,id);
    },

    updatePicture: async(req,res) => {
        const id = req.user.id;
        await userModel.updatePicture(res,req.file.filename,id);
    },

    search: async(req,res) => {
        const keyword = req.query.keyword;
        await userModel.search(res,keyword)
    },

    k6: async(req,res) => {
        await userModel.k6(res) 
    }
}
