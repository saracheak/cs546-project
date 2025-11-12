import {dbConnection} from './mongoConnection.js';

const getCollectionFn = (collection) => {
  let _col = undefined;

  return async () => {
    if (!_col) {
      const db = await dbConnection();
      _col = await db.collection(collection);
    }
    return _col;
  };
};

//List all collections
export const users = getCollectionFn('users');
export const ratings = getCollectionFn('ratings');
export const parks = getCollectionFn('parks');
export const biscuits = getCollectionFn('biscuits');
