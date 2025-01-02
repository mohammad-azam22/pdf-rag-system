const express = require('express');
const rootRoutes = require('./Backend/routes/route')
const bodyParser = require('body-parser');
const path = require('path');

const app = express()
const PORT = 3000

// Middleware Functions
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('Frontend'));

app.use("/", rootRoutes);

// root endpoint
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'Frontend/html', 'index.html'));
});

app.listen(PORT, () => {
    console.log("Application running on port: " + PORT);
    console.log("http://localhost:3000");
})