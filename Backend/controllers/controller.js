const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const pythonPath = path.join(__dirname, '..\\..\\Scripts\\python')

const uploadFile = (req, res) => {
    const file = req.file;
    if (!file) {
        return res.status(400).send({message: 'No file uploaded.'});
    }
    res.send({message: 'File uploaded successfully!'});
}

const getEmbeddings = async (req, res) => {
    const success = await new Promise((resolve, reject) => {
        exec(`${pythonPath} ./Backend/scripts/step-1.py`, (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                reject(false);
            }
            else {
                console.log("Chunks Generated");
                resolve(true);
            }
        });
    });
    res.send({success : success});
}

const postQuery = async (req, res) => {

    await new Promise((resolve, reject) => {
        const query = req.body.query;
        fs.writeFile('./Data/query.txt', query, (err) => { 
            if (err) throw err;
            console.log("query.txt file created")
        }); 
        exec(`${pythonPath} ./Backend/scripts/step-2.py`, (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                reject('Error executing script');
            }
            else {
                console.log("Response Generated");
                resolve();
            }
        });
    });
    fs.readFile('./Data/response.txt', 'utf16le', (err, data) => {
        if (err) throw err;
        res.send({response: data});
    })
}

module.exports = {
    uploadFile,
    getEmbeddings,
    postQuery
}