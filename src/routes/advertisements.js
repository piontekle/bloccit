const express = require("express");
const router = express.Router();

const advertController = require("../controllers/advertisementController");

router.get("/advertisements", advertController.index);
router.get("/advertisements/new", advertController.new);
router.post("/advertisements/create", advertController.create);
router.get("/advertisements/:id", advertController.show);
router.post("/advertisements/:id/destroy", advertController.destroy);
router.get("/advertisements/:id/edit", advertController.edit);
router.post("/advertisements/:id/update", advertController.update);

module.exports = router;
