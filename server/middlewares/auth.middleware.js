import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('JWT_SECRET is not defined');

// ✅ Use your existing authenticate middleware
export const authenticate = async (req, res, next) => {
  try {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) return res.status(401).json({ success: false, error: 'Token required' });

    const payload = jwt.verify(token, JWT_SECRET);

    req.user = payload;

    // If in development mode, print the token data
    if (process.env.NODE_ENV === 'development' && token) {
      console.log("MiddleWare Authentication ✅");
    }

    next();
  } catch (err) {
    console.log("MiddleWare Authentication ❌");
    console.error(err);
    res.status(401).json({ success: false, error: 'Unauthorized' });
  }
};

// ✅ Admin middleware - checks if user has admin or staff role
export const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
  }

  if (!['admin', 'staff'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      error: 'Admin access required. Only admin and staff roles can access this resource.'
    });
  }

  if (process.env.NODE_ENV === 'development') {
    console.log(`✅ Admin access granted for user: ${req.user.email} (${req.user.role})`);
  }

  next();
};

// ✅ Super Admin middleware - checks if user has admin role (not staff)
export const isSuperAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Super admin access required. Only admin role can access this resource.'
    });
  }

  if (process.env.NODE_ENV === 'development') {
    console.log(`✅ Super Admin access granted for user: ${req.user.email}`);
  }

  next();
};
