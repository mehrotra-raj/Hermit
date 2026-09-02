import pool  from "../db/conn.js"
export const createOrganizer = async (req, res) => {

    const user_id = req.user?.sub; //although authMiddleware checks req.user exists, we still check "req.user?"
    
    try {
        await pool.query(
            `INSERT INTO organizers(user_id)
            VALUES ($1)`,
            [user_id]
        );
    } catch(err) {
        return res.status(409).json({
            message: "Some db error",
            err
        })
    }

    return res.status(201).json({
        user_id,
        message: "created organizer profile",
    })
}