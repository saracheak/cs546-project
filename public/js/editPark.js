// public/js/editPark.js
(() => {
    function getEl(id) {
      return document.getElementById(id);
    }
  
    function setError(msg) {
      let errorEl = document.getElementById("edit-park-error");
      if (!errorEl) {
        // Create a message container if your template doesn't have one
        errorEl = document.createElement("p");
        errorEl.id = "edit-park-error";
        errorEl.className = "error form-msg";
        const form = document.querySelector("form.new-park-form") || document.querySelector("form");
        if (form) form.prepend(errorEl);
      }
      errorEl.textContent = msg;
    }
  
    function clearError() {
      const errorEl = document.getElementById("edit-park-error");
      if (errorEl) errorEl.textContent = "";
    }
  
    function isNonEmptyString(s) {
      return typeof s === "string" && s.trim().length > 0;
    }
  
    // Light validation rules (client-side only; server must still validate)
    function validateParkName(name) {
      if (!isNonEmptyString(name)) return "Park name is required.";
      const trimmed = name.trim();
      if (trimmed.length < 2) return "Park name must be at least 2 characters.";
      if (trimmed.length > 100) return "Park name must be 100 characters or fewer.";
      return null;
    }
  
    function validateStreet(street) {
      if (!isNonEmptyString(street)) return "Street 1 is required.";
      const trimmed = street.trim();
      if (trimmed.length < 3) return "Street 1 must be at least 3 characters.";
      if (trimmed.length > 120) return "Street 1 must be 120 characters or fewer.";
      return null;
    }
  
    function validateCity(city) {
      if (!isNonEmptyString(city)) return "City is required.";
      const trimmed = city.trim();
      if (trimmed.length < 2) return "City must be at least 2 characters.";
      if (trimmed.length > 60) return "City must be 60 characters or fewer.";
      // allow letters, spaces, dots, apostrophes, hyphens
      if (!/^[a-zA-Z.\-'\s]+$/.test(trimmed)) return "City contains invalid characters.";
      return null;
    }
  
    function validateState(state) {
      if (!isNonEmptyString(state)) return "State is required.";
      // If you only allow NY in your app, enforce it:
      // return state.trim() === "NY" ? null : "State must be NY.";
      return null;
    }
  
    function validateZip(zip) {
      if (!isNonEmptyString(zip)) return "Zip code is required.";
      const trimmed = zip.trim();
      if (!/^\d{5}$/.test(trimmed)) return "Zip code must be exactly 5 digits.";
      return null;
    }
  
    function validateParkType(type) {
      if (!isNonEmptyString(type)) return "Park type is required.";
      const trimmed = type.trim();
      if (trimmed !== "run" && trimmed !== "off-leash") {
        return "Park type must be either 'run' or 'off-leash'.";
      }
      return null;
    }
  
    function trimInputs(fields) {
      for (const el of fields) {
        if (el && typeof el.value === "string") {
          el.value = el.value.trim();
        }
      }
    }
  
    document.addEventListener("DOMContentLoaded", () => {
      // Your editPark.handlebars uses the same ids as newPark.handlebars
      const form =
        document.getElementById("edit-park-form") ||
        document.querySelector("form.new-park-form") ||
        document.querySelector("form");
  
      if (!form) return;
  
      const parkNameEl = getEl("park_name");
      const parkTypeEl = getEl("park_type");
      const street1El = getEl("street_1");
      const street2El = getEl("street_2");
      const cityEl = getEl("city");
      const stateEl = getEl("state");
      const zipEl = getEl("zip_code");
  
      // Optional: live clear error when user edits fields
      const inputs = [parkNameEl, parkTypeEl, street1El, street2El, cityEl, stateEl, zipEl].filter(Boolean);
      inputs.forEach((el) => el.addEventListener("input", clearError));
  
      form.addEventListener("submit", (e) => {
        clearError();
  
        // Trim first so validation is accurate
        trimInputs([parkNameEl, street1El, street2El, cityEl, stateEl, zipEl]);
  
        const errors = [];
  
        if (parkNameEl) {
          const err = validateParkName(parkNameEl.value);
          if (err) errors.push(err);
        }
  
        if (parkTypeEl) {
          const err = validateParkType(parkTypeEl.value);
          if (err) errors.push(err);
        }
  
        if (street1El) {
          const err = validateStreet(street1El.value);
          if (err) errors.push(err);
        }
  
        // street_2 optional
        if (street2El && isNonEmptyString(street2El.value)) {
          const s2 = street2El.value.trim();
          if (s2.length > 120) errors.push("Street 2 must be 120 characters or fewer.");
        }
  
        if (cityEl) {
          const err = validateCity(cityEl.value);
          if (err) errors.push(err);
        }
  
        if (stateEl) {
          const err = validateState(stateEl.value);
          if (err) errors.push(err);
        }
  
        if (zipEl) {
          const err = validateZip(zipEl.value);
          if (err) errors.push(err);
        }
  
        if (errors.length > 0) {
          e.preventDefault();
          setError(errors[0]); // show first error only (clean UX)
          return;
        }
      });
    });
  })();
  