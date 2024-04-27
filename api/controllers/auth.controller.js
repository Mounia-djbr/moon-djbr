import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";

export const register = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log(hashedPassword);

        // Create new user and save to DB
        const newUser = await prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword,
            },
        });

        console.log(newUser);

        // Respond with success message or appropriate response
        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        // Handle errors
        console.error("Error occurred during registration:", error);
        res.status(500).json({ error: "Failed to register user" });
    }
};

export const login = async (req, res) => {
    const { username, password } = req.body;
    try{

        // CHECK IF THE USER EXISTS

        const user = await prisma.user.findUnique({
            where:{username},
        });

        if(!user) return res.status(401).json({ message: "Invalid Credentials!" });

        // CHECK IF THE PASSWORD IS CORRECT

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if(!isPasswordValid) return res.status(401).json({ message: "Invalid Credentials!" });

        // GENERATE COOKIE TOKEN AND SEND TO THE USER

        //res.setHeader("Set-Cookie", "test=" + "myValue").json("success")
        const age = 1000 * 60 * 60 * 24 * 7;

        const token = jwt.sign(
          {
            id: user.id,
            isAdmin: false,
          },
          process.env.JWT_SECRET_KEY,
          {expiresIn: age }
        );

        const {password: userPassword, ...userInfo} = user;

        res.cookie("token", token, {
            httpOnly:true,
            //secure:true,
            maxAge: age,
        }).status(200).json(userInfo);

    }catch (error) {
        // Handle errors
        console.error("Error occurred during registration:", error);
        res.status(500).json({ error: "Failed to login!" });
    }
    
};

export const logout = (req, res) => {
    res.clearCookie("token").status(200).json({message:"Logout Successful"});
};
