import pool from "../db/conn.js"

export const createShow = async (req, res) => {
    //show creation logic   

    const {auditorium_id, event_id, starts_at} = req.body;


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

   //check whether this event is hosted by thi 
    const eventCheck = await pool.query(
    `SELECT id FROM events WHERE id = $1 AND organizer_id = $2`,
    [event_id, organizer_id]
);

if (eventCheck.rows.length === 0) {
    return res.status(403).json({ message: "Not your event" });
}

    try {
        await pool.query(
            `
            INSERT INTO shows (auditorium_id, event_id, starts_at, status)
            VALUES ($1, $2, $3, $4)
            `,
            [auditorium_id, event_id, starts_at, 'Coming soon...']
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