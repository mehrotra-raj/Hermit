CREATE TABLE users (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE organizers (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id INT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(150) DEFAULT 'Independent',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE venues (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    total_capacity INT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE events(
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    organizer_id INT NOT NULL REFERENCES organizers(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    description VARCHAR(1000),
    category VARCHAR(50) NOT NULL DEFAULT 'general'
        CHECK (category IN('movie', 'concert', 'standup', 'sports', 'theatre', 'general')),
    duration_minutes INT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
); --this could be a movie "Sholay" or a standup show "Jealous of Sabziwala" 


CREATE TABLE shows (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    venue_id INT NOT NULL REFERENCES venues(id),
    event_id INT NOT NULL REFERENCES events(id),
    -- title VARCHAR (50) NOT NULL,
    -- description TEXT, 
    --earlier there was no "Events" table but due to data redundancy and inconsistency, we added an Events table
    --So, description and text is now a part of Event
    starts_at TIMESTAMPTZ NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Coming soon...'
        CHECK(status IN('Coming soon...', 'Published', 'Cancelled', 'Completed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
); --this means Sholay at PVR INOX Pune, or Jealous of Sabziwala Habitat

CREATE TABLE seats(
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    venue_id INT NOT NULL REFERENCES venues(id),
    section VARCHAR(50) DEFAULT 'Standard'
        CHECK(section IN('Standard', 'Premium', 'Balcony')),
    row_label VARCHAR(10),             -- "A", "B", "C"... NULL for General Admission
    seat_number INT,                   -- 1, 2, 3... NULL for General Admission
    UNIQUE(venue_id, section, row_label, seat_number)
);


CREATE TABLE show_seats (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    show_id INT NOT NULL REFERENCES shows(id) ON DELETE CASCADE,
    seat_id INT REFERENCES seats(id),   

    status VARCHAR(20) NOT NULL DEFAULT 'available'
        CHECK (status IN ('available', 'booked')),

    UNIQUE(show_id, seat_id)
);
