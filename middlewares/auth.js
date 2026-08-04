require('dotenv').config();
const jwt = require('jsonwebtoken')
const User = require('../models/user');

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        message: "Unauthorized request"
      });
    }
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Invalid Authorization header"
      });
    }
    const token = authHeader.split(" ")[1];
    if (!token || token === "null") {
      return res.status(401).json({
        message: "Invalid token"
      });
    }
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findById(payload.id).select("status");
    if (!user || user.status === "blocked") {
      return res.status(403).json({
        message: "Account blocked"
      });
    }
    req.user = payload;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Access token expired"
      });
    }
    return res.status(401).json({
      message: "Token verification failed"
    });
  }
};

module.exports = verifyToken;