(function () {
    const form = document.getElementById("new-park-form");
    const errorEl = document.getElementById("new-park-error");
  
    // If we're not on the new park page, do nothing
    if (!form || !errorEl) return;
  
    form.addEventListener("submit", function (event) {
      errorEl.textContent = "";
  
      const parkName = document.getElementById("park_name")?.value.trim();
      const parkType = document.getElementById("park_type")?.value.trim();
      const street1 = document.getElementById("street_1")?.value.trim();
      const street2 = document.getElementById("street_2")?.value.trim() || "";
      const city = document.getElementById("city")?.value.trim();
      const state = document.getElementById("state")?.value.trim();
      const zip = document.getElementById("zip_code")?.value.trim();
  
      // Required fields (street_2 optional)
      if (!parkName || !parkType || !street1 || !city || !state || !zip) {
        event.preventDefault();
        errorEl.textContent = "All fields except Street 2 are required.";
        return;
      }
  
      // Park type validation 
      if (parkType !== "run" && parkType !== "off-leash") {
        event.preventDefault();
        errorEl.textContent = "Please select a valid park type.";
        return;
      }
  
      // Zip must be exactly 5 digits
      if (!/^\d{5}$/.test(zip)) {
        event.preventDefault();
        errorEl.textContent = "Zip code must be exactly 5 digits.";
        return;
      }
  
      const fieldsToCheck = [parkName, parkType, street1, street2, city, state];
      for (const value of fieldsToCheck) {
        if (value.includes("<") || value.includes(">")) {
          event.preventDefault();
          errorEl.textContent = "Fields cannot contain '<' or '>'.";
          return;
        }
      }
    });
  })();
  