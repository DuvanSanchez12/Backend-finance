import mongoose from 'mongoose';

// Desestructuramos desde el objeto principal
const { Schema, model, models } = mongoose;

const UserSchema = new Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  clerkId: { type: String },
  createdAt: { type: Date, default: Date.now },
});

// Usamos mongoose.models para verificar si ya existe
const User = models.User || model('User', UserSchema);

export default User;