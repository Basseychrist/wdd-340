const invModel = require("../models/inventory-model");
const Util = {};

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications();
  console.log(data);
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

module.exports = Util;

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
