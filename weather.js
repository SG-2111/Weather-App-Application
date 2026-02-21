const axios = require('axios');
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

//env
require('dotenv').config();

//To fetch weather data
async function getWeatherData(city){
    const apikey = process.env.API_KEY;
    const apiurl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apikey}&units=metric`;

    try{
        const rep = await axios.get(apiurl);
        const weatherdata = rep.data;

        return{
            city: weatherdata.name,
            temp: weatherdata.main.temp + '\u00B0C',
            desc: weatherdata.weather[0].description
        };

    } catch(error){
        return null;
    }
}

//Server Creation
const server=http.createServer((req,res)=>{
    const parseurl = url.parse(req.url,true);

    //Serve the HTML Page
    if (req.method==='GET' && parseurl.pathname==='/'){
        const pathfile = path.join(__dirname, 'weather.html');

        fs.readFile(pathfile, 'utf8', (err, data)=>{
            if (err){
                res.writeHead(500,{'Content-Type':'text/plain'});
                res.end('There seems to be an Internal Server Error');
            }else{
                res.writeHead(200,{'Content-Type':'text/html'});
                res.end(data);
            }
        });

    //Weather API

    }else if (req.method==='GET' && parseurl.pathname==='/weather'){
        const loc = parseurl.query.loc;

        if(loc){
            getWeatherData(loc).then(weatherdata =>{
                if(weatherdata){
                    res.writeHead(200, {'Content-Type':'application/json'});
                    res.end(JSON.stringify(weatherdata));
                }else{
                    res.writeHead(404,{'Content-Type':'application/json'});
                    res.end(JSON.stringify({error: 'Location not found'}));
                }
            });
        }else{
            res.writeHead(400,{'Content-Type':'application/json'});
            res.end(JSON.stringify({error: 'Location parameter missing'}));
        }
    }else{
        res.writeHead(404, {'Content-Type':'text/plain'});
        res.end('Not Found');
    }
});

//Start the server
const port = 3000;
server.listen(port, ()=>{
    console.log(`Server running at http://localhost:${port}`);
});