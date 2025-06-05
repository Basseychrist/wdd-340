const invModel = require("../models/inventory-model");
const utilities = require("../utilities"); // adjust path as needed

const invCont = {};

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId;
  const data = await invModel.getInventoryByClassificationId(classification_id);
  const grid = await utilities.buildClassificationGrid(data);
  let nav = await utilities.getNav();
  const className = data[0].classification_name;
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  });
};

/* ***************************
 * Build the detail view for a specific inventory item
 * ************************** */
invCont.buildDetailView = async function (req, res, next) {
  const inv_id = req.params.inv_id;
  const vehicle = await invModel.getInventoryById(inv_id);
  if (!vehicle) {
    return next({ status: 404, message: "Vehicle not found." });
  }
  const nav = await utilities.getNav();
  const detail = utilities.buildDetailView(vehicle);
  const title = `${vehicle.inv_make} ${vehicle.inv_model}`;
  res.render("inventory/detail", {
    title,
    nav,
    detail,
  });
};

invCont.buildManagementView = async function (req, res, next) {
  try {
    const nav = await utilities.getNav();
    const classificationsData = await invModel.getClassifications();
    const classifications = classificationsData.rows;
    const message = req.flash("message");
    res.render("inventory/management", {
      title: "Inventory Management",
      nav,
      message,
      classifications, // Pass this to the view
    });
  } catch (error) {
    next(error);
  }
};

invCont.buildAddClassification = async function (req, res, next) {
  try {
    const nav = await utilities.getNav();
    res.render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors: null,
      message: req.flash("message"),
    });
  } catch (error) {
    next(error);
  }
};

invCont.addClassification = async function (req, res, next) {
  try {
    const { classification_name } = req.body;
    const nav = await utilities.getNav();
    // Insert into DB via model
    const result = await invModel.addClassification(classification_name);
    if (result) {
      req.flash("message", "Classification added successfully!");
      res.redirect("/inv");
    } else {
      res.render("inventory/add-classification", {
        title: "Add Classification",
        nav,
        errors: [{ msg: "Failed to add classification." }],
        message: null,
      });
    }
  } catch (error) {
    next(error);
  }
};

invCont.buildAddInventory = async function (req, res, next) {
  try {
    const nav = await utilities.getNav();
    const classificationList = await utilities.buildClassificationList();
    res.render("inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      classificationList,
      errors: null,
      message: req.flash("message"),
      sticky: {},
    });
  } catch (error) {
    next(error);
  }
};

invCont.addInventory = async function (req, res, next) {
  try {
    const nav = await utilities.getNav();
    const classificationList = await utilities.buildClassificationList(
      req.body.classification_id
    );
    const result = await invModel.addInventory(req.body);
    if (result) {
      req.flash("message", "Inventory item added successfully!");
      res.redirect("/inv");
    } else {
      res.render("inventory/add-inventory", {
        title: "Add Inventory",
        nav,
        classificationList,
        errors: [{ msg: "Failed to add inventory item." }],
        message: null,
        sticky: req.body,
      });
    }
  } catch (error) {
    next(error);
  }
};

invCont.deleteClassification = async function (req, res, next) {
  try {
    const { classification_id } = req.body;
    const success = await invModel.deleteClassification(classification_id);
    if (success) {
      req.flash("message", "Classification deleted successfully.");
    } else {
      req.flash(
        "message",
        "Could not delete classification. It may be in use."
      );
    }
    res.redirect("/inv");
  } catch (error) {
    next(error);
  }
};

module.exports = invCont;
