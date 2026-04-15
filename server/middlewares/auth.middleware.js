
const jwt = require('jsonwebtoken');



const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('JWT_SECRET is not defined');

exports.authenticate = async (req, res, next) => {
  try {
    const token = req.headers['authorization']?.split(' ')[1];


    //console.log("Header Token:" + token);


    if (!token) return res.status(401).json({ error: 'Token required' });

    const payload = jwt.verify(token, JWT_SECRET);

    req.user = payload; // attach payload to request
    //console.log(payload);
    /// console.log("Logged In 🙋🏻 User ID:", req.user.id);
    /// console.log("Logged In 🙋🏻 User Email:", req.user.email);
    /// console.log("Logged In 🙋🏻 User Role:", req.user.role);
    ///



    console.log("MiddleWare Authentication ✅")
    next();
  } catch (err) {
    console.log("MiddleWare Authentication ❌")
    console.error(err);
    res.status(401).json({ error: 'Unauthorized' });
  }
};


