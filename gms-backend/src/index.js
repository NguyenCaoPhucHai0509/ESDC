const express = require('express');  
const dotenv = require('dotenv');  
const mongoose = require('mongoose');  

dotenv.config();  

const app = express();  
const port = process.env.PORT || 3001;  

app.get('/', (req, res) => {  
    res.send('Hello World! everyone');  
});  

console.log('MongoDB URI:', process.env.MONGO_DB);  

mongoose.connect(`mongodb+srv://phuchai5904:${process.env.MONGO_DB}@esdcfinal.jsujxjv.mongodb.net/?retryWrites=true&w=majority&appName=ESDCFINAL`)  
    .then(() => {  
        console.log('Connect DB success!');  
    })  
    .catch(err => {  
        console.log(err);  
    });  

app.listen(port, () => {  
    console.log('Server is running in port:', port);  
});  