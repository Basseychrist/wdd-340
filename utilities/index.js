// const invModel = require("../models/inventory-model");
const { body, validationResult } = require("express-validator");
const Util = {};

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  const invModel = require("../models/inventory-model"); // <-- move require here
  let data = await invModel.getClassifications();
  let list = "<ul>";
  list += '<li><a href="/" title="Home page">Home</a></li>';
  data.rows.forEach((row) => {
    list += "<li>";
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>";
    list += "</li>";
  });
  list += "</ul>";
  return list;
};

/* **************************************
 * Build the classification view HTML
 * ************************************ */
Util.buildClassificationGrid = async function (data) {
  let grid;
  if (data.length > 0) {
    grid = '<ul id="inv-display">';
    data.forEach((vehicle) => {
      grid += "<li>";
      grid +=
        '<a href="../../inv/detail/' +
        vehicle.inv_id +
        '" title="View ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        ' details">' +
        '<img src="' +
        vehicle.inv_thumbnail +
        '" alt="Thumbnail of ' +
        (vehicle.inv_year ? vehicle.inv_year + " " : "") +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        '">' +
        '<div class="namePrice">' +
        "<hr>" +
        "<h2>" +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        "</h2>" +
        "<span>$" +
        new Intl.NumberFormat("en-US").format(vehicle.inv_price) +
        "</span>" +
        "</div></a>";
      grid += "</li>";
    });
    grid += "</ul>";
  } else {
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>';
  }
  return grid;
};

/* **************************************
 * Build the vehicle detail view HTML
 * ************************************ */
Util.buildDetailView = function (vehicle) {
  let html = `<section class="vehicle-detail">
    <div class="vehicle-image">
      <img src="${vehicle.inv_image}" alt="${vehicle.inv_year} ${
    vehicle.inv_make
  } ${vehicle.inv_model}">
    </div>
    <div class="vehicle-info">
      <h2>${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}</h2>
      <p class="vehicle-price"><strong>Price:</strong> $${new Intl.NumberFormat(
        "en-US"
      ).format(vehicle.inv_price)}</p>
      <p><strong>Mileage:</strong> ${new Intl.NumberFormat("en-US").format(
        vehicle.inv_miles
      )} miles</p>
      <p><strong>Description:</strong> ${vehicle.inv_description}</p>
      <p><strong>Color:</strong> ${vehicle.inv_color}</p>
      <p><strong>Classification:</strong> ${vehicle.classification_name}</p>
    </div>
  </section>`;
  return html;
};

// Build the classification <select> list for forms
const buildClassificationList = async function (classification_id = null) {
  const invModel = require("../models/inventory-model"); // <-- move require here
  const data = await invModel.getClassifications();
  let classificationList =
    '<select name="classification_id" id="classificationList" required>';
  classificationList += "<option value=''>Choose a Classification</option>";
  data.rows.forEach((row) => {
    classificationList += `<option value="${row.classification_id}"`;
    if (
      classification_id != null &&
      row.classification_id == classification_id
    ) {
      classificationList += " selected";
    }
    classificationList += `>${row.classification_name}</option>`;
  });
  classificationList += "</select>";
  return classificationList;
};

function handleErrors(fn) {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = {
  getNav: Util.getNav,
  buildClassificationGrid: Util.buildClassificationGrid,
  buildDetailView: Util.buildDetailView,
  handleErrors,
  classificationRules: () => [
    body("classification_name")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Classification name is required.")
      .matches(/^[A-Za-z0-9]+$/)
      .withMessage("No spaces or special characters allowed."),
  ],
  checkClassificationData: async (req, res, next) => {
    const { validationResult } = require("express-validator");
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const nav = await module.exports.getNav();
      return res.render("inventory/add-classification", {
        title: "Add Classification",
        nav,
        errors: errors.array(),
        message: null,
      });
    }
    next();
  },
  inventoryRules: () => [
    body("classification_id")
      .isInt()
      .withMessage("Classification is required."),
    body("inv_make").trim().notEmpty().withMessage("Make is required."),
    body("inv_model").trim().notEmpty().withMessage("Model is required."),
    body("inv_year").isInt({ min: 1886 }).withMessage("Valid year required."),
    body("inv_description")
      .trim()
      .notEmpty()
      .withMessage("Description required."),
    body("inv_image").trim().notEmpty().withMessage("Image path required."),
    body("inv_thumbnail")
      .trim()
      .notEmpty()
      .withMessage("Thumbnail path required."),
    body("inv_price").isFloat({ min: 0 }).withMessage("Valid price required."),
    body("inv_miles").isInt({ min: 0 }).withMessage("Valid miles required."),
    body("inv_color").trim().notEmpty().withMessage("Color required."),
  ],
  checkInventoryData: async (req, res, next) => {
    const { validationResult } = require("express-validator");
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const classificationList = await module.exports.buildClassificationList(
        req.body.classification_id
      );
      const nav = await module.exports.getNav();
      return res.render("inventory/add-inventory", {
        title: "Add Inventory",
        nav,
        classificationList,
        errors: errors.array(),
        message: null,
        sticky: req.body,
      });
    }
    next();
  },
  buildClassificationList,
};
