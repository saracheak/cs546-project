//this file is for validation/error checking functions which can be used for all other files
import { ObjectId } from "mongodb"

export const checkId = (id) => {
    id = id.trim();
    if(ObjectId.isValid(id)) return true;
    return false;
}

