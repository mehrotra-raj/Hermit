import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import { signupSchema, loginSchema} from "../schemas/auth.schema.js";
import pool from "../db/conn.js";

export const signup = async (req, res) => {
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
export const login = async (req, res) => {
    const result = loginSchema.safeParse(req.body)

    if(!result) {
        return res.status(401).json({
            message: "Invalid credentials",
        })
    }

    const {email, password} = result.data;
    

    /*
    Since we have id as primary key and email as unique, these both are 
    indexed and thus fetching them is faster,
    we are not indexing anything else for now.
     */
    const dbResult = await pool.query(
        `SELECT id, password_hash
        FROM users
        WHERE email = $1`,
        [email]
    )

    //Return Invalid credentials if email does not exist
    if(dbResult.rows.length === 0) {
        return res.status(401).json({
            message: "Invalid Credentials",
        })
    }


    const {id, password_hash} = dbResult.rows[0]

    //Compare the passwords
    const PasswordMatches = await bcrypt.compare(password, password_hash)

    if (!PasswordMatches) {
        return res.status(401).json({
            message: "Invalid credentials"
        })
    }
    const payload = {
        sub : id,
    }

    const token = jwt.sign(
        payload,
        process.env.JWT_SECRET,
        {
            expiresIn: "2d"
        }
    )

    res.status(200).json({
        message: "Successfully Logged In",
        token,
    })
}
