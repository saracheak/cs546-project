(function(){
    const createForm = document.getElementById("create-park-form");
    const createError = document.getElementById("create-park-error");

    if(createForm && createError){
        createForm.addEventListener("submit", function(event){
            createError.textContent= "";

            const newParkName = document.getElementById("park_name");
            const newParkType = document.getElementById("park_type");
            const newStreet1 = document.getElementById("street_1");
            const newStreet2 = document.getElementById("street_2");
            const newCity = document.getElementById("city");
            const newState = document.getElementById("state");
            const newZip = document.getElementById("zip_code");

            const parkName = newParkName.value.trim();
            const parkType = newParkType.value.trim();
            const street1 = newStreet1.value.trim();
            const street2 = newStreet2.value.trim();
            const city = newCity.value.trim();
            const state = newState.value.trim();
            const zip = newZip.value.trim();

            if(!parkName || !parkType || !street1 || !city || !state || !zip){
                event.preventDefault();
                createError.textContent= "All fields except Street 2 are required";
                return;
            }

            const zipCheck = /^[0-9]{5}$/;
            if(!zipCheck.test(zip)){
                event.preventDefault();
                createError.textContent = "Zip code must be 5 digits.";
                return;
            }

            if(state.length !== 2){
                event.preventDefault();
                createError.textContent= "State should be a 2-letter code.";
                return;
            }

            const xssCheck = [parkName, parkType, street1, street2, city, state];
            for(let i= 0; i< xssCheck.length; i++){
                const value = xssCheck[i];
                if(value.indexOf("<") !== -1 || value.indexOf(">") !== -1){
                    event.preventDefault();
                    createError.textContent = "Fields cannot contain '<' or '>'.";
                    return;
                }
            }

        });
    }

    const deleteForm = document.getElementById("delete-park-form");
    const deleteError = document.getElementById("delete-park-error");

    if(deleteForm && deleteError){
        deleteForm.addEventListener("submit", function(event){
            deleteError.textContent= "";

            const deleteId = document.getElementById("delete_park_id");
            const parkId = deleteId.value.trim();

            if(!parkId){
                event.preventDefault();
                deleteError.textContent= "Park ID is required.";
                return;
            }

            const idCheck = /^[0-9a-fA-F]{24}$/;
            if(!idCheck.test(parkId)){
                event.preventDefault();
                deleteError.textContent = "Park ID must be a 24-character hex string.";
                return;
            }
        });
    }
})();