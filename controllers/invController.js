const invModel = require("../models/inventory-model");
const utilities = require("../utilities"); // adjust path as needed

const invCont = {};

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  try {
    const classificationId = req.params.classificationId;
    const data = await invModel.getInventoryByClassificationId(
      classificationId
    );
    let className = "Unknown Classification";
    if (data && data.length > 0) {
      className = data[0].classification_name;
    }
    let nav = await utilities.getNav();
    const grid = await utilities.buildClassificationGrid(data);
    res.render("./inventory/classification", {
      title: className + " vehicles",
      nav,
      grid,
      errors: null,
    });
  } catch (error) {
    next(error);
  }
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

    // --- Empty space for select list ---
    const classificationSelect = await utilities.buildClassificationList();
    // -----------------------------------

    const classificationsData = await invModel.getClassifications();
    const classifications = classificationsData.rows;
    const message = req.flash("message");
    res.render("inventory/management", {
      title: "Inventory Management",
      nav,
      message,
      classifications,
      classificationSelect, // Pass select list to view
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

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id);
  const invData = await invModel.getInventoryByClassificationId(
    classification_id
  );
  if (invData[0] && invData[0].inv_id) {
    return res.json(invData);
  } else {
    next(new Error("No data returned"));
  }
};

/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.buildEditInventoryView = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.params.inv_id);
    let nav = await utilities.getNav();
    const itemData = await invModel.getInventoryById(inv_id);
    const classificationSelect = await utilities.buildClassificationList(
      itemData.classification_id
    );
    const itemName = `${itemData.inv_make} ${itemData.inv_model}`;
    const message = req.flash("message");
    const sticky = {
      inv_id: itemData.inv_id,
      classification_id: itemData.classification_id,
      inv_make: itemData.inv_make,
      inv_model: itemData.inv_model,
      inv_year: itemData.inv_year,
      inv_description: itemData.inv_description,
      inv_image: itemData.inv_image,
      inv_thumbnail: itemData.inv_thumbnail,
      inv_price: itemData.inv_price,
      inv_miles: itemData.inv_miles,
      inv_color: itemData.inv_color,
    };
    res.render("./inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationSelect: classificationSelect,
      errors: null,
      message: req.flash("notice", itemName + " updated successfully."),
      inv_id: itemData.inv_id,
      sticky,
    });
  } catch (error) {
    next(error);
  }
};

/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav();
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body;
  const updateResult = await invModel.updateInventory(
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  );

  if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model;
    req.flash("notice", `The ${itemName} was successfully updated.`);
    res.redirect("/inv/");
  } else {
    const classificationSelect = await utilities.buildClassificationList(
      classification_id
    );
    const itemName = `${inv_make} ${inv_model}`;
    req.flash("notice", "Sorry, the insert failed.");
    res.status(501).render("inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationSelect: classificationSelect,
      errors: null,
      inv_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id,
    });
  }
};

// Show delete confirmation page
invCont.buildDeleteInventoryView = async function (req, res, next) {
  const inv_id = req.params.inv_id;
  const nav = await utilities.getNav();
  const itemData = await invModel.getInventoryById(inv_id);
  res.render("inventory/delete-inventory", {
    title: "Delete " + itemData.inv_make + " " + itemData.inv_model,
    nav,
    itemData,
    inv_id,
  });
};

// Handle delete POST
invCont.deleteInventory = async function (req, res, next) {
  const inv_id = req.params.inv_id;
  const deleteResult = await invModel.deleteInventory(inv_id);
  if (deleteResult) {
    req.flash("notice", "Inventory item deleted successfully.");
    res.redirect("/inv/");
  } else {
    req.flash("notice", "Delete failed.");
    res.redirect("/inv/");
  }
};

// Show delete classification confirmation page
invCont.buildDeleteClassificationView = async function (req, res, next) {
  try {
    const classification_id = req.params.classification_id;
    const nav = await utilities.getNav();
    const classification = await invModel.getClassificationById(
      classification_id
    );
    if (!classification) {
      req.flash("notice", "Classification not found.");
      return res.redirect("/inv/");
    }
    res.render("inventory/delete-classification", {
      title: "Delete Classification",
      nav,
      classification,
      classification_id,
    });
  } catch (error) {
    next(error);
  }
};

// Handle delete classification POST
invCont.deleteClassification = async function (req, res, next) {
  try {
    const classification_id = req.params.classification_id;
    const success = await invModel.deleteClassification(classification_id);
    if (success) {
      req.flash("notice", "Classification deleted successfully.");
    } else {
      req.flash("notice", "Could not delete classification. It may be in use.");
    }
    res.redirect("/inv/");
  } catch (error) {
    next(error);
  }
};

module.exports = invCont;
