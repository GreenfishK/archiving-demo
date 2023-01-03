const express = require('express');
const app = express();
const bodyParser = require('body-parser')
const cors = require('cors')

app.use('/', express.static('../client')); 
app.use(express.json());
app.use(bodyParser.json());  
app.use(bodyParser.urlencoded({extended: true})); 
app.use(cors())

const port = process.env.PORT || 3000;
app.listen(port,() => {
    console.log(`Listening on port ${port}...`)
});

app.post('/', (req, res) => {
	console.log('The client says:' + req.body.message);
    const responseObj = {'answer' : 'Hello World from the server!'}; 
   	res.send(JSON.stringify(responseObj));
    res.end(); 
});

app.post('/stats', (req, res) => {
 	const responseObj = {'answer' : 'Your server will soon implement this functionality. Be patient!'}; 
    res.write(JSON.stringify(responseObj));
    res.end();
});
