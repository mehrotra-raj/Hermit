import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import { signupSchema } from "../schemas/auth.schema.js";
import pool from "../db/conn.js";

const signup = async (req, res) => {
    const result = signupSchema.safeParse(req.body);

    if (!result.success) {
        console.log(result.error);
        return res.status(400).json({
            error : result.error.issues[0].message
        });
    }
    const { name, email, password } = result.data;

    //hash the password
    const saltRounds = 10;

    const passwordHash = await bcrypt.hash(password, saltRounds);

    const dbResult = await pool.query(
        `INSERT INTO users(name, email, password_hash)
        VALUES ($1, $2, $3)
        RETURNING id, name, email`,
        [name,email,passwordHash]
    )
    const user_id = dbResult.rows[0].id
    const payload = {
        sub : user_id,
    }

    const token = jwt.sign(
        payload,
        process.env.JWT_SECRET,
        {
            expiresIn: "2d"
        }
    )

    res.status(201).json({
        message : "User created",
        name,
        email,
        token,
    })
}

export default signup;