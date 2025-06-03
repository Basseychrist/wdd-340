const utilities = require("../utilities");
const accountModel = require("../models/account-model");

// REMOVE or COMMENT OUT this line:
// const accountController = require("../controllers/accountController");

async function buildAccount(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/account", {
    title: "My Account",
    nav,
    errors: null, // Always include this
  });
}

async function buildLogin(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null, // Always include this
  });
}

/* ****************************************
 *  Deliver registration view
 * *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null, // Already present, keep it
  });
}

module.exports = {
  buildAccount,
  buildLogin,
  buildRegister,
  registerAccount,
};

/* ****************************************
 *  Process Registration
 * *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav();
  const {
    account_firstname,
    account_lastname,
    account_email,
    account_password,
  } = req.body;

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    account_password
  );

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    );
    res.status(201).render("account/login", {
      title: "Login",
      nav,
      errors: null, // Add this line
    });
  } else {
    req.flash("notice", "Sorry, the registration failed.");
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
      errors: null, // Add this line
    });
  }
}
