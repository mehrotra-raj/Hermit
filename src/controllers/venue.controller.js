import pool from "../db/conn.js";

export const addVenue  = async (req, res) => {
    //Venue adding logic
    const user_id = req.user.sub;

    const {name, address, city, state} = req.body;

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

    try {
        await pool.query(
            `
            INSERT INTO venues(name, address, city, state)
            VALUES($1, $2, $3, $4)
            `,
            [name, address, city, state]
        )
    } catch (err) {
        return res.status(409).json({
            message: "Some db Error",
        })
    }
    return res.status(201).json({
        message: "Venue Added",
    })
}