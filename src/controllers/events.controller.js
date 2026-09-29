import pool from "../db/conn.js"

export const fetchAllEvents = async (req, res) =>  {

    /*
    I am temporarily fetching all events, later on, the plan is to fetch events that are coming
    or are recent event, by joining shows or changing events table
    */
    
    const dbResult = await pool.query(
        `
        SELECT id, title, description, category, duration_minutes
        FROM events
        `
    )
    
    const data = dbResult["rows"];
    return res.status(200).json({
        message: "Here are all the events:",
        events : data,
    })
}

export const fetchVenuesWithShows = async (req, res) => {

    const event_id = req.params.id;

    const dbResult = await pool.query(
        `
        SELECT
        v.id   AS venue_id,
        v.name AS venue_name,
        a.id   AS auditorium_id,
        s.id   AS show_id,
        s.starts_at
        FROM shows s
        JOIN auditoriums a ON s.auditorium_id = a.id
        JOIN venues v      ON a.venue_id     = v.id
        WHERE s.event_id = $1
        AND s.status IN ('Coming soon...', 'Published')
        ORDER BY v.id, s.starts_at
        `,[event_id]
    )

 
    const eventDetails = dbResult["rows"];



    //Create the flattened response for client, omit venue id as its only needed for us!


    const venues = [];

    for (const row  of eventDetails) {
        let venue = venues.find(v => v.id === row.venue_id);
        if (!venue) {
            venue = {
                id : row.venue_id,
                name : row.venue_name,
                shows: []
            };
            venues.push(venue);
        }
        venue.shows.push({
            id : row.show_id,
            starts_at: row.starts_at,
        })
    }

    return res.status(200).json({
        message: "Here are venues with their available shows:",
        venues,
    })
}

export const createEvent = async (req, res) => {


    const {title, description, category, duration_minutes} = req.body;

    const user_id = req.user.sub; //from the bearer token



    //find in the organizers table if there exists an organizer with this id

    const dbResult = await pool.query(
        `
        SELECT id 
        FROM organizers
        WHERE user_id = $1;
        `,
        [user_id]
    ) 
    
  

    if (dbResult.rows.length == 0) {
        return res.status(403).json({
            message: "Create an organizer account first",
        })
    }

    const organizer_id = dbResult.rows[0].id;
    try {
        await pool.query(
            `
            INSERT INTO events (organizer_id, title, description, category, duration_minutes)
            VALUES($1, $2, $3, $4, $5)
            `,
            [organizer_id, title, description, category, duration_minutes]

        )
    } catch (err) {
        console.log(err);
        return res.status(409).json({
            message : "Some db Error",
        })
    }
    return res.status(201).json({
        message : "created",
    })
}