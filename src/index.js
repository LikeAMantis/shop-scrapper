
import { readFile, readdirSync } from 'fs';
import express from 'express';
import bodyParser from 'body-parser';
var port = 3000;
var shops = readdirSync("./data").map(folder => (
        {
            name: folder, 
            categories: readdirSync(`./data/${folder}`).map(file => file.replace(".csv", ""))
        }
));


const app = express();
app.use(bodyParser.json());
app.use(express.static('./public'));

app.listen(port, () => {
    console.log(`Listening at http://localhost:${port}`)
})


app.get('/shops', (req, res) => {
    res.json(shops);
});

app.get('/items', (req, res) => {
    readFile(`./data/${req.query.categorie}.csv`, "utf8", function (err, fileData) {
        rows = fileData.split("\n");
        rows.shift();

        var items = parseRows(rows.slice(req.query.from, req.query.to));
        res.json(items);
    });
});

app.get('/filter', (req, res) => {
    readFile(`./data/${req.query.categorie}.csv`, "utf8", function (err, fileData) {
        rows = fileData.split("\n");
        rows.shift();

        var items = parseRows(rows.filter(x => x.toLowerCase().includes(req.query.text.toLowerCase())));
        res.json(items);
    });
});


function parseRows(rows) {
    return rows.map(x => x.split(",")).map(row => ({ name: row[1], price: row[2], imgUrl: row[3] }));
}