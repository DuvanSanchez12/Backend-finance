import jwt from 'jsonwebtoken';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      
      next();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      res.status(401).json({ message: "Token no válido o expirado" });
    }
  }

  if (!token) {
    res.status(401).json({ message: "No hay token, acceso denegado" });
  }
};