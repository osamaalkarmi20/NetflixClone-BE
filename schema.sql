DROP TABLE IF EXISTS addedmv;
CREATE TABLE IF NOT EXISTS  addedmv (
    id SERIAL PRIMARY KEY,
    title VARCHAR,
    release_date VARCHAR, 
   poster_path VARCHAR, 
   overview VARCHAR, 
   comment VARCHAR
   
);