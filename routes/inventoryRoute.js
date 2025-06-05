// Needed Resources
const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const utilities = require("../utilities");

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

// Route for vehicle detail view
router.get("/detail/:inv_id", invController.buildDetailView);

// Management view route
router.get("/", invController.buildManagementView);

// Show add classification form
router.get("/add-classification", invController.buildAddClassification);

// Handle add classification POST
router.post(
  "/add-classification",
  utilities.classificationRules(), // server-side validation middleware
  utilities.checkClassificationData,
  invController.addClassification
);

// Show add inventory form
router.get("/add-inventory", invController.buildAddInventory);

// Handle add inventory POST
router.post(
  "/add-inventory",
  utilities.inventoryRules(), // server-side validation middleware
  utilities.checkInventoryData,
  invController.addInventory
);

// Handle delete classification POST
router.post("/delete-classification", invController.deleteClassification);

module.exports = router;
