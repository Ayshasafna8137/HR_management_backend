const express = require("express");
const router = express.Router();

const userController = require("../controllers/user");

router.get("/", userController.getUsers);
router.post("/", userController.createUsers);
router.put("/:id", userController.updateUsers);
router.delete("/:id", userController.deleteUsers);

module.exports = router;
