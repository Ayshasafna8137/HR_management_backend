const express = require('express');
const router = express.Router();
const Controller = require('../controllers/user');


router.post('/', Controller.create);



module.exports = router;
