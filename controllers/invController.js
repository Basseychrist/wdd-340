const invModel = require("../models/inventory-model");
const utilities = require("../utilities");

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

module.exports = invCont;
