const express = require('express');
const server = express();
const axios = require("axios");
require('dotenv').config();
const cors = require('cors');
server.use(cors());
const APIKey = process.env.apiKey;
const PORT =process.env.PORT ;
const pg = require('pg');

const client = new pg.Client(process.env.DATABASE_URL);
server.use(express.json());
//////////////////////////////////////////////////////////////////////////////
//ALL SERVICES ///////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////

server.get('/trending', trendingHandler)
server.post('/addMovies',addMoviesHandler)
server.get('/getMovies', getMoviesHandler)
server.delete('/DELETE/:id',deleteMoviesHandler)
server.put('/UPDATE/:id',updateFavlisthandler)
//////////////////////////////////////////////////////////////////////////////
//ERROR SERVICES /////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////
server.get('/error', error500Handler)

server.get('*', error400Handler)

//////////////////////////////////////////////////////////////////////////////
//HANDLERS ///////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////



function trendingHandler(req, res) {
    const url = `https://api.themoviedb.org/3/trending/all/day?api_key=${APIKey}`



    axios.get(url)
        .then(axiosResult => {

            let mapResult = axiosResult.data.results.map(item => {
                let singlemovie = new axiosTrending(item.id, item.title, item.release_date, item.poster_path, item.overview);
                return singlemovie;
            })
            console.log(mapResult)
            res.send(mapResult)

        })
        .catch((error) => {
            console.log('sorry you have something error', error)
            res.status(500).send(error);
        })


}
function addMoviesHandler(req, res) {
    const movieadded = req.body;
    console.log(movieadded);
    const sql = `INSERT INTO addedmv (title, release_date , poster_path, overview,comment )
    VALUES ($1, $2,$3,$4,$5);`
    const values = [movieadded.title , movieadded.release_date,movieadded.poster_path,movieadded.overview,movieadded.comment]; 
    client.query(sql,values)
    .then(data=>{
        res.send("sent");
    })
    .catch((error)=>{
        errorHandler(error,req,res)
    })

   
}
function getMoviesHandler(req, res) {
    const sql = `SELECT * FROM addedmv`;
    client.query(sql)
    .then(data=>{
        res.send(data.rows);
    })

    .catch((error)=>{
        errorHandler(error,req,res)
    })
}
function deleteMoviesHandler(req,res){
    const id = req.params.id;
    console.log(req.params);
    const sql = `DELETE FROM addedmv WHERE id=${id} RETURNING *;`
    client.query(sql)
    .then(data=>{
        const sql = `SELECT * FROM addedmv`;
        client.query(sql)
        .then(data=>{
            res.send(data);
        })
    
        .catch((error)=>{
            errorHandler(error,req,res)
        })
    }

    )
    .catch((error)=>{
        errorHandler(error,req,res)
    })
}
function updateFavlisthandler(req, res) {
    const id = req.params.id;
    const updateFavlist = req.body;
    const sql = `UPDATE addedmv
    SET comment = $1
    WHERE id = ${id} RETURNING *;`;
    const values = [updateFavlist.comment];
    client.query(sql, values)
        .then(data => {
            const sql = `SELECT * FROM addedmv;`;
            client.query(sql)
        .then(data=>{
            res.send(data);
        })
    
        .catch((error)=>{
            errorHandler(error,req,res)
        })
        })
        .catch(error => {
            console.log(error)
        })
}
function error500Handler(req, res) {
    let error500 = {
        "status": 500,

        "responseText": 'Sorry, something went wrong'
    }
    res.status(error500.status).send(error500);
}


function error400Handler(req, res) {
    let error400 = {
        "status": 400,

        "responseText": 'page not found error'
    }
    res.status(error400.status).send(error400)
}

function errorHandler(error,req,res){
    const err = {
        status: 500,
        message: error
    }
    res.status(500).send(err);
}

//////////////////////////////////////////////////////////////////////////////
//CONSTRUCTOR FUNCTIONS///////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////


function axiosTrending(id, title, release_date, poster_path, overview) {
    this.id = id;
    this.title = title;
    this.release_date = release_date;
    this.poster_path = poster_path;
    this.overview = overview;
}



/////////////////////////////////////////////////////////////////////////
client.connect()
.then(()=>{server.listen(PORT, () => {
    console.log(`Listening on ${PORT}: I'm ready`)
})})