BEGIN;

-- Demo users. The password for both accounts is: password123
INSERT INTO users (name, email, password_hash)
VALUES
    (
        'Raj Organizer',
        'organizer@hermit.local',
        '$2b$10$8Yzt5hHOgp1Ev3pCoFlRK.4uldA6dkp4PX4rkyka5NUk4UK0PoOrC'
    ),
    (
        'Hermit Guest',
        'guest@hermit.local',
        '$2b$10$8Yzt5hHOgp1Ev3pCoFlRK.4uldA6dkp4PX4rkyka5NUk4UK0PoOrC'
    )
ON CONFLICT (email) DO UPDATE
SET name = EXCLUDED.name,
    password_hash = EXCLUDED.password_hash;

INSERT INTO organizers (user_id, company_name)
SELECT id, 'Hermit Live'
FROM users
WHERE email = 'organizer@hermit.local'
ON CONFLICT (user_id) DO UPDATE
SET company_name = EXCLUDED.company_name;

-- Venues
INSERT INTO venues (name, address, city, state, total_capacity)
SELECT seed.name, seed.address, seed.city, seed.state, seed.total_capacity
FROM (
    VALUES
        ('PVR INOX Phoenix Mall', 'Viman Nagar, Phoenix Marketcity', 'Pune', 'Maharashtra', 220),
        ('The Habitat', 'Khar West, 1st Floor, Unicontinental Building', 'Mumbai', 'Maharashtra', 180),
        ('Prithvi Theatre', '20 Janki Kutir, Juhu', 'Mumbai', 'Maharashtra', 200),
        ('Cinepolis Seasons Mall', 'Magarpatta City, Hadapsar', 'Pune', 'Maharashtra', 240),
        ('The Royal Opera House', 'Mama Parmanand Marg, Girgaon', 'Mumbai', 'Maharashtra', 260)
) AS seed(name, address, city, state, total_capacity)
WHERE NOT EXISTS (
    SELECT 1
    FROM venues existing
    WHERE existing.name = seed.name
);

-- Events: Priyadarshan favourites, acclaimed Hollywood films, and stand-up.
INSERT INTO events (organizer_id, title, description, category, duration_minutes)
SELECT organizer.id, seed.title, seed.description, seed.category, seed.duration_minutes
FROM (
    VALUES
        (
            'Hera Pheri',
            'A chaotic comedy classic about three roommates, one impossible scheme, and unforgettable timing.',
            'movie',
            156
        ),
        (
            'Hungama',
            'Priyadarshan''s fast-moving ensemble comedy of mistaken identities and perfectly timed confusion.',
            'movie',
            153
        ),
        (
            'Hulchul',
            'A lively romantic comedy where two feuding families and an elaborate plan collide.',
            'movie',
            149
        ),
        (
            'Bhool Bhulaiyaa',
            'A psychological mystery with sharp comedy, an old mansion, and an unforgettable performance.',
            'movie',
            159
        ),
        (
            'Garam Masala',
            'A photographer''s elaborate lie turns into a classic Priyadarshan comedy of errors.',
            'movie',
            146
        ),
        (
            'The Dark Knight',
            'Batman faces a criminal mastermind who pushes Gotham and its heroes to their limits.',
            'movie',
            152
        ),
        (
            'Fight Club',
            'An insomniac office worker finds an unsettling new outlet for rebellion and identity.',
            'movie',
            139
        ),
        (
            'Inception',
            'A specialist who enters dreams is offered a chance to erase an impossible past.',
            'movie',
            148
        ),
        (
            'Interstellar',
            'Explorers travel beyond our galaxy in search of a future for humanity.',
            'movie',
            169
        ),
        (
            'The Shawshank Redemption',
            'A quiet story of friendship, resilience, and hope inside a long prison sentence.',
            'movie',
            142
        ),
        (
            'Jealous of Sabziwala',
            'A stand-up special about everyday ambition, neighbourhood characters, and the strange glamour of a sabziwala''s life.',
            'standup',
            90
        ),
        (
            'Sidewalk Stories',
            'A sharp stand-up night about work, family, dating, and the tiny dramas of city life.',
            'standup',
            100
        ),
        (
            'Laughing Matters: Mumbai Edition',
            'A showcase of fresh comic voices with observational humour and a little audience chaos.',
            'standup',
            110
        )
) AS seed(title, description, category, duration_minutes)
CROSS JOIN (
    SELECT organizers.id
    FROM organizers
    JOIN users ON users.id = organizers.user_id
    WHERE users.email = 'organizer@hermit.local'
) AS organizer
WHERE NOT EXISTS (
    SELECT 1
    FROM events existing
    WHERE existing.title = seed.title
);

-- One scheduled experience for every seeded event.
INSERT INTO shows (venue_id, event_id, starts_at, status)
SELECT venue.id, event.id, seed.starts_at::timestamptz, seed.status
FROM (
    VALUES
        ('PVR INOX Phoenix Mall', 'Hera Pheri', '2026-10-03 18:30:00+05:30', 'Published'),
        ('Cinepolis Seasons Mall', 'Hungama', '2026-10-04 18:30:00+05:30', 'Published'),
        ('Prithvi Theatre', 'Hulchul', '2026-10-10 19:00:00+05:30', 'Coming soon...'),
        ('PVR INOX Phoenix Mall', 'Bhool Bhulaiyaa', '2026-10-11 18:30:00+05:30', 'Coming soon...'),
        ('Cinepolis Seasons Mall', 'Garam Masala', '2026-10-17 18:30:00+05:30', 'Coming soon...'),
        ('PVR INOX Phoenix Mall', 'The Dark Knight', '2026-10-18 18:00:00+05:30', 'Published'),
        ('Cinepolis Seasons Mall', 'Fight Club', '2026-10-24 18:30:00+05:30', 'Published'),
        ('PVR INOX Phoenix Mall', 'Inception', '2026-10-25 18:00:00+05:30', 'Coming soon...'),
        ('The Royal Opera House', 'Interstellar', '2026-10-31 17:30:00+05:30', 'Coming soon...'),
        ('The Royal Opera House', 'The Shawshank Redemption', '2026-11-01 17:30:00+05:30', 'Coming soon...'),
        ('The Habitat', 'Jealous of Sabziwala', '2026-10-09 20:00:00+05:30', 'Published'),
        ('The Habitat', 'Sidewalk Stories', '2026-10-16 20:00:00+05:30', 'Coming soon...'),
        ('The Habitat', 'Laughing Matters: Mumbai Edition', '2026-10-23 20:00:00+05:30', 'Coming soon...')
) AS seed(venue_name, event_title, starts_at, status)
JOIN venues venue ON venue.name = seed.venue_name
JOIN events event ON event.title = seed.event_title
WHERE NOT EXISTS (
    SELECT 1
    FROM shows existing
    WHERE existing.venue_id = venue.id
      AND existing.event_id = event.id
      AND existing.starts_at = seed.starts_at::timestamptz
);

-- Generate a consistent seat map for every seeded venue.
INSERT INTO seats (venue_id, section, row_label, seat_number)
SELECT venue.id, seat_map.section, CHR(64 + seat_row.row_number), seat_column.seat_number
FROM venues venue
CROSS JOIN (
    VALUES
        ('Standard', 8, 12),
        ('Premium', 4, 8),
        ('Balcony', 3, 10)
) AS seat_map(section, row_count, seats_per_row)
CROSS JOIN LATERAL generate_series(1, seat_map.row_count) AS seat_row(row_number)
CROSS JOIN LATERAL generate_series(1, seat_map.seats_per_row) AS seat_column(seat_number)
WHERE venue.name IN (
    'PVR INOX Phoenix Mall',
    'The Habitat',
    'Prithvi Theatre',
    'Cinepolis Seasons Mall',
    'The Royal Opera House'
)
ON CONFLICT (venue_id, section, row_label, seat_number) DO NOTHING;

-- Every show starts with all of its venue seats available.
INSERT INTO show_seats (show_id, seat_id, status)
SELECT shows.id, seats.id, 'available'
FROM shows
JOIN events ON events.id = shows.event_id
JOIN venues ON venues.id = shows.venue_id
JOIN seats ON seats.venue_id = venues.id
WHERE events.title IN (
    'Hera Pheri',
    'Hungama',
    'Hulchul',
    'Bhool Bhulaiyaa',
    'Garam Masala',
    'The Dark Knight',
    'Fight Club',
    'Inception',
    'Interstellar',
    'The Shawshank Redemption',
    'Jealous of Sabziwala',
    'Sidewalk Stories',
    'Laughing Matters: Mumbai Edition'
)
ON CONFLICT (show_id, seat_id) DO NOTHING;

COMMIT;
