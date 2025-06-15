const utilities = require("../utilities");

async function accountTypeCheck(req, res, next) {
  const user = req.session.user;
  if (
    user &&
    (user.account_type === "Employee" || user.account_type === "Admin")
  ) {
    return next();
  }
  req.flash(
    "error",
    "You must be logged in as an Employee or Admin to access this page."
  );
  const nav = await utilities.getNav();
  return res.status(403).render("account/login", {
    title: "Login",
    nav, // <-- Add this line
    message:
      "You must be logged in as an Employee or Admin to access this page.",
    errors: [],
  });
}

module.exports = accountTypeCheck;
