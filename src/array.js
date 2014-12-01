/**
 * return the index of an object in an array depending on the value of a
 * property
 * @param {array} array - the array
 * @param {string} pname - name of the property
 * @param {*} pvalue - expected value of the property
 * @returns {number} - the index if a hash was found, -1 otherwise
 * @private
 */
function _getIndexByProperty(array, pname, pvalue) {
  var i = 0;

  for (; i < array.length; i += 1) {
    if (array[i][pname] === pvalue) {
      return i;
    }
  }

  return -1;
}

/**
 * return an object in an array depending on the value of a property
 * @param {array} array - the array
 * @param {string} pname - name of the property
 * @param {*} pvalue - expected value of the property
 * @returns {*|null} - the hash if a hash was found, null otherwise
 * @private
 */
function _getValueByProperty(array, pname, pvalue) {
  var i = _getIndexByProperty(array, pname, pvalue);

  return array[i] || null;
}