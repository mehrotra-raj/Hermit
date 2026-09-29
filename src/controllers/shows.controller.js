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

    const client = await pool.connect();

    try {
        await client.query('BEGIN');
        const showResult = await client.query(
            `
            INSERT INTO shows (auditorium_id, event_id, starts_at, status)
            VALUES ($1, $2, $3, $4)
            RETURNING id
            `,
            [auditorium_id, event_id, starts_at, 'Coming soon...']
        );

        const showId = showResult.rows[0].id;

        const seatsResult = await client.query(
            `
            INSERT INTO show_seats(show_id, seat_id, status)
            SELECT $1, id, 'available'
            FROM seats
            WHERE auditorium_id = $2
            `,
            [showId, auditorium_id]
        )

        if (seatsResult.rowCount === 0) {         
            await client.query('ROLLBACK');       
            return res.status(400).json({ message: "This auditorium has no seats" });
        }

        await client.query('COMMIT');


        return res.status(201).json({
            show_id: showId,
            seats_created: seatsResult.rowCount,
            message: "Show created",
        })


    } catch (err) {
        await client.query('ROLLBACK');
        return res.status(500).json({
            err,
            message: "Some db Error",
        })
    } finally {
        client.release();
    }
}