const regValidate = require("../utilities/account-validation");
const express = require("express");
const router = express.Router();
const utilities = require("../utilities");
const accountController = require("../controllers/accountController");

/* ****************************************
 *  Deliver login view
 * *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/login", {
    title: "Login",
    nav,
  });
}

// GET /login (Deliver login view)
router.get("/login", utilities.handleErrors(buildLogin));

// GET / (My Account main page)
router.get("/account", utilities.handleErrors(accountController.buildAccount));

// GET /register (Deliver registration view)
router.get(
  "/register",
  utilities.handleErrors(accountController.buildRegister)
);

// POST /register (Process registration form)
router.post(
  "/register",
  regValidate.registationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
);

// Export the router
module.exports = router;
