// Needed Resources
const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const utilities = require("../utilities");
const accountTypeCheck = require("../middleware/accountTypeCheck"); // Import from middleware

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

// Route for vehicle detail view
router.get("/detail/:inv_id", invController.buildDetailView);

// Management view route
router.get("/", invController.buildManagementView);

// Show add classification form
router.get(
  "/add-classification",
  accountTypeCheck,
  invController.buildAddClassification
);

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

// Show delete classification confirmation page
router.get(
  "/delete-classification/:classification_id",
  invController.buildDeleteClassificationView
);

// Handle delete classification POST
router.post(
  "/delete-classification/:classification_id",
  invController.deleteClassification
);

// Example for routes/inventoryRoute.js
router.get(
  "/getInventory/:classification_id",
  utilities.handleErrors(invController.getInventoryJSON)
);

// Edit inventory item view route
router.get("/edit/:inv_id", invController.buildEditInventoryView);

// Handle update inventory POST
router.post(
  "/update/",
  utilities.inventoryRules(), // validation rules
  utilities.checkUpdateData, // validation handler
  utilities.handleErrors(invController.updateInventory)
);

// Show delete inventory confirmation view
router.get("/delete/:inv_id", invController.buildDeleteInventoryView);

// Handle delete inventory POST
router.post("/delete/:inv_id", invController.deleteInventory);

module.exports = router;
