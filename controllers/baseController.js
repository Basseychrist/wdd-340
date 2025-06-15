const utilities = require("../utilities/");
const baseController = {};

baseController.buildHome = async function (req, res, next) {
  let nav = await utilities.getNav();
  res.render("index", {
    title: "Home",
    nav,
    // No need to pass messages if using express-messages middleware
  });
};

module.exports = baseController;
