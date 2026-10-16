import pool from "../db/conn.js"

export const book = async(req, res) => {

    const {seats} = req.body; //this gives ids of shows to be booked

    const user_id = req.user.sub;

    //counting all seats selected by user that are already booked
    const bookedCount = await pool.query(
        `SELECT
    COUNT(*) FILTER (WHERE status = 'booked')::int AS booked_count,
    MIN(show_id) AS show_id
    FROM show_seats
    WHERE id = ANY($1)`,
    [seats]
    )

    const { booked_count, show_id } = bookedCount.rows[0];


    if (booked_count !== 0) {
        return res.status(400).json({
            message : `${booked_count} of your selected seats already booked`,
        })
    }
    
    try {

    if (booked_count !== 0) {
        return res.status(400).json({
            message : `${booked_count} of your selected seats already booked`,
        })
    }
        await pool.query(
        `
        INSERT INTO bookings (user_id, show_id, total_amount)
        VALUES($1, $2, $3)
        RETURNING id`
        , [user_id, show_id, 500]
        )

          await pool.query(
        `UPDATE show_seats
         SET status = 'booked'
         WHERE id = ANY($1)`,
        [seats]
    );

        return res.status(200).json({
            message: "OK",
        })



    } catch (err) {
        console.log(err);
        return res.status(400).json({
            message: "There was some error",
        })
    }

    
}