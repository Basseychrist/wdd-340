/* ******************************************
 * This server.js file is the primary file of the
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const cookieParser = require("cookie-parser");
const session = require("express-session");
const pool = require("./database/");
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const env = require("dotenv").config();
const app = express();
const inventoryRoute = require("./routes/inventoryRoute");
const accountRoutes = require("./routes/accountRoute");
const utilities = require("./utilities");
const baseController = require("./controllers/baseController");
const errorRoute = require("./routes/errorRoute");
const flash = require("connect-flash");

/* ***********************
 * Middleware
 * ************************/
app.use(
  session({
    store: new (require("connect-pg-simple")(session))({
      createTableIfMissing: true,
      pool,
    }),
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    name: "sessionId",
  })
);

app.use(flash());
app.use(function (req, res, next) {
  res.locals.messages = require("express-messages")(req, res);
  next();
});

app.use(cookieParser());
app.use(utilities.checkJWTToken);
app.use((req, res, next) => {
  res.locals.user = req.session.user;
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "./layouts/layout"); // not at views root

/* ***********************
 * Routes
 *************************/
app.use(express.static("public"));
// app.use(static);
app.get("/", baseController.buildHome);
// Inventory routes
app.use("/inv", inventoryRoute);
// Account routes
app.use("/account", accountRoutes);
app.use("/", errorRoute);

// File Not Found Route - must be last route in list
app.use(async (req, res, next) => {
  next({ status: 404, message: "Sorry, we appear to have lost that page." });
});

/* ***********************
 * Express Error Handler
 * Place after all other middleware
 *************************/
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav();
  console.error(`Error at: "${req.originalUrl}": ${err.message}`);
  res.status(err.status || 500).render("errors/error", {
    title: err.status || "Server Error",
    message: err.message,
    notice: req.flash("notice"),
    error: process.env.NODE_ENV === "development" ? err : {},
    nav, // Always pass nav!
  });
});

// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(err.status || 500);
//   res.render("errors/error", {
//     message: err.message,
//     error: process.env.NODE_ENV === "development" ? err : {},
//     title: "Server Error",
//   });
// });

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT;
const host = process.env.HOST;

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`);
});

/* **************
index route
**************/
// app.get("/", function (req, res) {
//   res.render("index", { title: "Home" });
// });
