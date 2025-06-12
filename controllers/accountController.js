const jwt = require("jsonwebtoken");
require("dotenv").config();
const utilities = require("../utilities");
const accountModel = require("../models/account-model");
const bcrypt = require("bcryptjs");

// REMOVE or COMMENT OUT this line:
// const accountController = require("../controllers/accountController");

async function buildAccount(req, res, next) {
  try {
    const nav = await require("../utilities").getNav();
    res.render("account/account", {
      title: "My Account",
      nav,
      message: req.flash("message"),
      errors: null,
    });
  } catch (error) {
    next(error);
  }
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

  // Hash the password before saving
  const hashedPassword = await bcrypt.hash(account_password, 10);

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword // Use hashed password here
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

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav();
  const { account_email, account_password } = req.body;
  const accountData = await accountModel.getAccountByEmail(account_email);
  console.log("accountData:", accountData); // <-- Add this
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.");
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    });
    return;
  }
  try {
    if (!accountData.account_password) {
      req.flash("notice", "Please check your credentials and try again.");
      return res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: [{ msg: "Invalid credentials." }],
        account_email,
      });
    }
    const passwordMatch = await bcrypt.compare(
      account_password,
      accountData.account_password
    );
    console.log("Password match:", passwordMatch); // <-- Add this
    if (passwordMatch) {
      delete accountData.account_password;
      const accessToken = jwt.sign(
        accountData,
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: 3600 * 1000 }
      );
      if (process.env.NODE_ENV === "development") {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 });
      } else {
        res.cookie("jwt", accessToken, {
          httpOnly: true,
          secure: true,
          maxAge: 3600 * 1000,
        });
      }
      return res.redirect("/account/");
    } else {
      req.flash("notice", "Please check your credentials and try again.");
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      });
    }
  } catch (error) {
    req.flash("notice", "An error occurred. Please try again.");
    return res.status(500).render("account/login", {
      title: "Login",
      nav,
      errors: [{ msg: "An error occurred. Please try again." }],
      account_email,
    });
  }
}

// Export the functions for use in routes
module.exports = {
  buildAccount,
  buildLogin,
  buildRegister,
  registerAccount,
  accountLogin,
};
