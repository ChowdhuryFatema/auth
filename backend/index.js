import express from 'express';
import passport from 'passport';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { connectDB } from './db/connectDB.js';
import authRoutes from './Routes/authRoute.js';
import path from 'path';
import session from'express-session';
import './passport.js';

const app = express();

dotenv.config();

app.use(
  session({
    name: 'session',
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production' }
  })
);



app.use(passport.initialize());
app.use(passport.session());


const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();

app.use(cors({
    origin: [
        'http://localhost:5173',
        'https://auth-b4ol.onrender.com',
    ],
    credentials: true 
}));

app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());


app.use("/api/auth", authRoutes)
if(process.env.NODE_ENV === "production"){
    app.use(express.static(path.join(__dirname, "frontend/dist")));
    app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
    })
}

app.listen(PORT, () => {
    connectDB();
    console.log(`Server is running on port ${PORT}`);
})




