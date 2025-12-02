//this file is for validation/error checking functions which can be used for all other files
import { ObjectId } from "mongodb"

export const checkId = (id) => {
    id = id.trim();
    if(ObjectId.isValid(id)) return true;
    return false;
}

export const checkString = (str, varName) => {
  if (str === undefined || str === null) {
    throw `${varName} must be supplied`;
  }
  if (typeof str !== "string") {
    throw `${varName} must be a string`;
  }
  str = str.trim();
  if (str.length === 0) {
    throw `${varName} cannot be an empty string or just spaces`;
  }
  return str;
};

export const checkIdInRatings = (id, varName) => {
  id = checkString(id, varName);
  if (!ObjectId.isValid(id)) {
    throw `${varName} is not a valid ObjectId`;
  }

  return id;
};