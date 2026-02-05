import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "El usuario ya existe" });

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      clerkId: Date.now().toString(),
    });

    res.status(201).json({ message: "Usuario creado con éxito", userId: newUser._id });
  } catch (error) {
    res.status(500).json({ message: "Error al registrar", error: error.message });
  }
};
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Buscar si el usuario existe
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "El usuario no existe" });

    // 2. Comparar la contraseña enviada con la encriptada en la DB
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) return res.status(400).json({ message: "Contraseña incorrecta" });

    // 3. Crear el Token JWT (Vence en 1 hora)
    const token = jwt.sign(
      { id: user._id, email: user.email, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({ result: user, token });
  } catch (error) {
    res.status(500).json({ message: "Algo salió mal", error: error.message });
  }
};