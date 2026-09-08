// seed.js
//
// WARNING: This seed is DESTRUCTIVE.
// It truncates all application tables with CASCADE before inserting sample data.

import pool from "../src/db/conn.js"

async function seed() {
    const client = await pool.connect();

    const counts = {
        users: 0,
        organizers: 0,
        venues: 0,
        auditoriums: 0,
        events: 0,
        shows: 0,
        seats: 0,
        show_seats: 0,
        bookings: 0,
        booking_seats: 0,
    };

    try {
        await client.query('BEGIN');

        // ---------------------------------------------------------
        // 1. Clear existing data
        // ---------------------------------------------------------
        await client.query(`
            TRUNCATE TABLE
                booking_seats,
                bookings,
                show_seats,
                seats,
                shows,
                events,
                auditoriums,
                venues,
                organizers,
                users
            RESTART IDENTITY CASCADE
        `);

        // ---------------------------------------------------------
        // 2. Users
        // ---------------------------------------------------------
        const usersData = [
            ['Raj Sharma', 'raj@example.com', '$2b$10$seededPasswordHash1'],
            ['Aman Verma', 'aman@example.com', '$2b$10$seededPasswordHash2'],
            ['Priya Singh', 'priya@example.com', '$2b$10$seededPasswordHash3'],
            ['Neha Kapoor', 'neha@example.com', '$2b$10$seededPasswordHash4'],
            ['Arjun Mehta', 'arjun@example.com', '$2b$10$seededPasswordHash5'],
        ];

        const userIds = [];

        for (const [name, email, passwordHash] of usersData) {
            const result = await client.query(
                `
                INSERT INTO users (name, email, password_hash)
                VALUES ($1, $2, $3)
                RETURNING id
                `,
                [name, email, passwordHash]
            );

            userIds.push(result.rows[0].id);
            counts.users++;
        }

        // ---------------------------------------------------------
        // 3. Organizers
        // Users 1 and 2 are also organizers.
        // ---------------------------------------------------------
        const organizerData = [
            [userIds[0], 'Raj Entertainment'],
            [userIds[1], 'Aman Live Productions'],
        ];

        const organizerIds = [];

        for (const [userId, companyName] of organizerData) {
            const result = await client.query(
                `
                INSERT INTO organizers (user_id, company_name)
                VALUES ($1, $2)
                RETURNING id
                `,
                [userId, companyName]
            );

            organizerIds.push(result.rows[0].id);
            counts.organizers++;
        }

        // ---------------------------------------------------------
        // 4. Venues
        // ---------------------------------------------------------
        const venuesData = [
            [
                'PVR INOX Phoenix Mall',
                'Phoenix Marketcity, Viman Nagar',
                'Pune',
                'Maharashtra',
            ],
            [
                'PVR INOX Select Citywalk',
                'Saket',
                'New Delhi',
                'Delhi',
            ],
            [
                'Bangalore International Convention Centre',
                'Doddaballapur Road',
                'Bengaluru',
                'Karnataka',
            ],
        ];

        const venueIds = [];

        for (const [name, address, city, state] of venuesData) {
            const result = await client.query(
                `
                INSERT INTO venues (name, address, city, state)
                VALUES ($1, $2, $3, $4)
                RETURNING id
                `,
                [name, address, city, state]
            );

            venueIds.push(result.rows[0].id);
            counts.venues++;
        }

        // ---------------------------------------------------------
        // 5. Two auditoriums per venue
        // ---------------------------------------------------------
        const auditoriumIdsByVenue = {};

        for (const venueId of venueIds) {
            auditoriumIdsByVenue[venueId] = [];

            for (let screenNumber = 1; screenNumber <= 2; screenNumber++) {
                const result = await client.query(
                    `
                    INSERT INTO auditoriums (venue_id)
                    VALUES ($1)
                    RETURNING id
                    `,
                    [venueId]
                );

                const auditoriumId = result.rows[0].id;

                auditoriumIdsByVenue[venueId].push(auditoriumId);
                counts.auditoriums++;
            }
        }

        // ---------------------------------------------------------
        // 6. Events
        // ---------------------------------------------------------
        const eventsData = [
            [
                organizerIds[0],
                'Sholay',
                'A special-screening of the classic Indian action drama.',
                'movie',
                204,
            ],
            [
                organizerIds[0],
                'Jealous of Sabziwala',
                'A hilarious standup comedy special.',
                'standup',
                90,
            ],
            [
                organizerIds[1],
                'Arijit Singh Live',
                'An unforgettable evening of live music.',
                'concert',
                150,
            ],
            [
                organizerIds[1],
                'India Beats Festival',
                'A live celebration of Indian music and culture.',
                'concert',
                180,
            ],
        ];

        const eventIds = [];

        for (const [
            organizerId,
            title,
            description,
            category,
            durationMinutes,
        ] of eventsData) {
            const result = await client.query(
                `
                INSERT INTO events (
                    organizer_id,
                    title,
                    description,
                    category,
                    duration_minutes
                )
                VALUES ($1, $2, $3, $4, $5)
                RETURNING id
                `,
                [
                    organizerId,
                    title,
                    description,
                    category,
                    durationMinutes,
                ]
            );

            eventIds.push(result.rows[0].id);
            counts.events++;
        }

        // ---------------------------------------------------------
        // 7. Shows
        // 1-2 shows per event, distributed across auditoriums.
        // All dates are future dates.
        // ---------------------------------------------------------
        const allAuditoriumIds = Object.values(auditoriumIdsByVenue).flat();

        const showsData = [
            [eventIds[0], allAuditoriumIds[0], '2026-09-15T18:30:00+05:30'],
            [eventIds[0], allAuditoriumIds[1], '2026-09-16T21:00:00+05:30'],

            [eventIds[1], allAuditoriumIds[2], '2026-09-20T19:00:00+05:30'],
            [eventIds[1], allAuditoriumIds[3], '2026-09-21T19:00:00+05:30'],

            [eventIds[2], allAuditoriumIds[4], '2026-09-25T20:00:00+05:30'],
            [eventIds[2], allAuditoriumIds[5], '2026-09-26T20:00:00+05:30'],

            [eventIds[3], allAuditoriumIds[0], '2026-10-02T18:00:00+05:30'],
        ];

        const showIds = [];
        const showAuditoriumMap = {};

        for (const [eventId, auditoriumId, startsAt] of showsData) {
            const result = await client.query(
                `
                INSERT INTO shows (
                    auditorium_id,
                    event_id,
                    starts_at,
                    status
                )
                VALUES ($1, $2, $3, $4)
                RETURNING id
                `,
                [
                    auditoriumId,
                    eventId,
                    startsAt,
                    'Published',
                ]
            );

            const showId = result.rows[0].id;

            showIds.push(showId);
            showAuditoriumMap[showId] = auditoriumId;
            counts.shows++;
        }

        // ---------------------------------------------------------
        // 8. Seats
        //
        // Every auditorium:
        // A-C = Premium
        // D-J = Standard
        // 10 seats per row
        // ---------------------------------------------------------
        const seatsByAuditorium = {};

        for (const auditoriumId of allAuditoriumIds) {
            seatsByAuditorium[auditoriumId] = [];

            for (let rowIndex = 0; rowIndex < 10; rowIndex++) {
                const rowLabel = String.fromCharCode(
                    'A'.charCodeAt(0) + rowIndex
                );

                const section = rowIndex < 3 ? 'Premium' : 'Standard';

                for (let seatNumber = 1; seatNumber <= 10; seatNumber++) {
                    const result = await client.query(
                        `
                        INSERT INTO seats (
                            auditorium_id,
                            section,
                            row_label,
                            seat_number
                        )
                        VALUES ($1, $2, $3, $4)
                        RETURNING id
                        `,
                        [
                            auditoriumId,
                            section,
                            rowLabel,
                            seatNumber,
                        ]
                    );

                    const seatId = result.rows[0].id;

                    seatsByAuditorium[auditoriumId].push({
                        id: seatId,
                        section,
                        rowLabel,
                        seatNumber,
                    });

                    counts.seats++;
                }
            }
        }

        // ---------------------------------------------------------
        // 9. Show seats
        //
        // Each show gets a separate inventory of every seat
        // belonging to its auditorium.
        // ---------------------------------------------------------
        const showSeatIdsByShow = {};

        for (const showId of showIds) {
            const auditoriumId = showAuditoriumMap[showId];

            showSeatIdsByShow[showId] = [];

            for (const seat of seatsByAuditorium[auditoriumId]) {
                const result = await client.query(
                    `
                    INSERT INTO show_seats (
                        show_id,
                        seat_id,
                        status
                    )
                    VALUES ($1, $2, $3)
                    RETURNING id
                    `,
                    [showId, seat.id, 'available']
                );

                showSeatIdsByShow[showId].push({
                    id: result.rows[0].id,
                    seatId: seat.id,
                    section: seat.section,
                    rowLabel: seat.rowLabel,
                    seatNumber: seat.seatNumber,
                });

                counts.show_seats++;
            }
        }

        // ---------------------------------------------------------
        // 10. Sample bookings
        //
        // seat prices are derived from the seat section:
        // Premium  = ₹450
        // Standard = ₹300
        //
        // booking_seats stores the actual price paid for each seat.
        // total_amount is computed from those seat prices.
        // ---------------------------------------------------------
        const bookingData = [
            {
                userId: userIds[2],
                showId: showIds[0],
                seatNumbers: [
                    ['A', 1],
                    ['A', 2],
                    ['B', 1],
                ],
            },
            {
                userId: userIds[3],
                showId: showIds[2],
                seatNumbers: [
                    ['D', 4],
                    ['D', 5],
                ],
            },
            {
                userId: userIds[4],
                showId: showIds[4],
                seatNumbers: [
                    ['F', 6],
                    ['F', 7],
                    ['G', 6],
                    ['G', 7],
                ],
            },
        ];

        for (const booking of bookingData) {
            const showSeats = showSeatIdsByShow[booking.showId];

            const selectedShowSeats = [];

            for (const [rowLabel, seatNumber] of booking.seatNumbers) {
                const showSeat = showSeats.find(
                    (seat) =>
                        seat.rowLabel === rowLabel &&
                        seat.seatNumber === seatNumber
                );

                if (!showSeat) {
                    throw new Error(
                        `Seat ${rowLabel}${seatNumber} not found for show ${booking.showId}`
                    );
                }

                selectedShowSeats.push(showSeat);
            }

            let totalAmount = 0;

            for (const showSeat of selectedShowSeats) {
                const seatPrice =
                    showSeat.section === 'Premium' ? 450 : 300;

                totalAmount += seatPrice;
            }

            const bookingResult = await client.query(
                `
                INSERT INTO bookings (
                    user_id,
                    show_id,
                    total_amount
                )
                VALUES ($1, $2, $3)
                RETURNING id
                `,
                [
                    booking.userId,
                    booking.showId,
                    totalAmount,
                ]
            );

            const bookingId = bookingResult.rows[0].id;
            counts.bookings++;

            for (const showSeat of selectedShowSeats) {
                const seatPrice =
                    showSeat.section === 'Premium' ? 450 : 300;

                await client.query(
                    `
                    INSERT INTO booking_seats (
                        booking_id,
                        show_seat_id,
                        seat_price
                    )
                    VALUES ($1, $2, $3)
                    `,
                    [
                        bookingId,
                        showSeat.id,
                        seatPrice,
                    ]
                );

                // Keep show-seat inventory consistent with the booking.
                await client.query(
                    `
                    UPDATE show_seats
                    SET status = $1
                    WHERE id = $2
                    `,
                    ['booked', showSeat.id]
                );

                counts.booking_seats++;
            }
        }

        // ---------------------------------------------------------
        // Commit
        // ---------------------------------------------------------
        await client.query('COMMIT');

        console.log('\nSeed completed successfully.');
        console.log('Inserted rows:');

        for (const [table, count] of Object.entries(counts)) {
            console.log(`  ${table}: ${count}`);
        }

        console.log(
            '\nNote: This seed uses TRUNCATE ... CASCADE and is destructive.'
        );
    } catch (error) {
        await client.query('ROLLBACK');

        console.error('\nSeed failed. Transaction rolled back.');
        console.error(error);

        process.exitCode = 1;
    } finally {
        client.release();
    }
}

seed();