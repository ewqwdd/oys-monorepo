const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const generateApiKey = () => {
  const uuid = uuidv4() + process.env.API_KEY_SECRET;

  const hashed = bcrypt.hashSync(uuid, 10);
  return hashed;
}

const checkApiKey = async (apiKey) => {
  const user = await User.findOne({ apiKey });
  return !!user;
}

module.exports = {
  generateApiKey,
  checkApiKey,
};