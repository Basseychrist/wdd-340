const form = document.querySelector("#updateForm");
if (form) {
  form.addEventListener("change", function () {
    const updateBtn = form.querySelector("button[type='submit']");
    if (updateBtn) updateBtn.removeAttribute("disabled");
  });

  form.addEventListener("submit", function (e) {
    const classification = form.querySelector("#classificationList");
    if (classification && !classification.value) {
      e.preventDefault();
      alert("Please select a classification.");
      classification.focus();
      return false;
    }
    // Add more client-side checks as needed
  });
}
