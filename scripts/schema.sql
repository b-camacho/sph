-- Create authors table
CREATE TABLE authors (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    bio TEXT,
    image TEXT
);

-- Create works table
CREATE TABLE works (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    descr TEXT,
    image TEXT,
    author_id INTEGER NOT NULL,
    FOREIGN KEY (author_id) REFERENCES authors (id) ON DELETE CASCADE
);

-- Create buyers table
CREATE TABLE buyers (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL
);

-- Create transactions table
CREATE TABLE txs (
    id SERIAL PRIMARY KEY,
    buyer_id INTEGER NOT NULL,
    work_id INTEGER NOT NULL,
    date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (buyer_id) REFERENCES buyers (id) ON DELETE CASCADE,
    FOREIGN KEY (work_id) REFERENCES works (id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX idx_works_author ON works(author_id);
CREATE INDEX idx_txs_buyer ON txs(buyer_id);
CREATE INDEX idx_txs_work ON txs(work_id);
CREATE INDEX idx_txs_date ON txs(date);