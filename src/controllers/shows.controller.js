import pool from "../db/conn.js"

export const createShow = async (req, res) => {
    //show creation logic   

    const {venue_id, title, description, starts_at, status} = req.body;


    const user_id = req.user.sub;

    const dbResult = await pool.query(
        `
        SELECT id
        FROM organizers
        WHERE user_id = $1;
        `,
        [user_id]
    )

    if (dbResult.rows.length === 0) {
        return res.status(409).json({
            message: "Create an organizer account first",
        })
    }

    const organizer_id = dbResult.rows[0].id;

    try {
        await pool.query(
            `
            INSERT INTO shows (organizer_id, venue_id, title, description, starts_at, status)
            VALUES ($1, $2, $3, $4, $5, $6)
            `,
            [organizer_id, venue_id, title, description, starts_at, status]
        )
    } catch (err) {
        return res.status(403).json({
            err,
            message: "Some db Error",
        })
    }


    return res.status(201).json({
        user_id,
        message: "Show created",
    })
}