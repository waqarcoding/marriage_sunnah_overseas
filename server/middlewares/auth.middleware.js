import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('JWT_SECRET is not defined');

export const authenticate = async (req, res, next) => {
  try {
    const token = req.headers['authorization']?.split(' ')[1];


    if (!token) return res.status(401).json({ error: 'Token required' });

    const payload = jwt.verify(token, JWT_SECRET);

    req.user = payload;
    // If in development mode, print the token data (header and payload)
    if (process.env.NODE_ENV === 'development' && token) {
      console.log("MiddleWare Authentication ✅");
    }

    next();
  } catch (err) {
    console.log("MiddleWare Authentication ❌");
    console.error(err);
    res.status(401).json({ error: 'Unauthorized' });
  }
};