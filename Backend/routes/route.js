const express = require('express')
const router = express.Router()
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { uploadFile, getEmbeddings, postQuery } = require('../controllers/controller')

const deletePrevFiles = async () => {
    const filesToDelete = [
        './Data/Data.pdf',
        './Data/chunks.pkl',
        './Data/embeddings.pkl',
        './Data/query.txt',
        './Data/response.txt'
    ];

    filesToDelete.forEach((filePath) => {
        fs.unlink(filePath, (err) => {
            if (err) {
                console.error(`Error deleting file ${filePath}`);
            }
            else {
                console.log(`File deleted successfully: ${filePath}`);
            }
        });
    });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../../Data/'));
    },
    filename: (req, file, cb) => {
        cb(null, 'Data.pdf');
    }
});

// Initialize multer with the defined storage
const upload = multer({ storage: storage });


router.post('/upload', async (req, res, next) => {
    try {
        // Delete previous files before uploading the new one
        await deletePrevFiles();

        // Now proceed with the file upload
        upload.single('file')(req, res, (err) => {
            if (err) {
                return next(err); // Handle multer errors
            }
            uploadFile(req, res); // Call your controller's uploadFile function
        });
    } catch (err) {
        console.error('Error deleting previous files:', err);
        res.status(500).send('Error deleting previous files');
    }
});
// router.post('/upload', deletePrevFiles(), upload.single('file'), uploadFile)
router.get('/embeddings', getEmbeddings)
router.post('/query', postQuery)

module.exports = router;