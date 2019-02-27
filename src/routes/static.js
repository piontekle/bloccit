const express = require("express");
const router = express.Router();
const staticController = require("../controllers/staticController");

router.get("/", staticController.index);

router.get("/about", staticController.about);

router.get("/marco", (req, res, next) => {
  res.send("polo")
})

module.exports = router;
