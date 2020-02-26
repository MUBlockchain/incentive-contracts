
/**
 * Full web3JS wrapper for the MUBCItemShop contract
 */

/**
 * Initialize the instance in this scope
 * @param _instance the object being stored
 */
exports.init = (_instance) => { this.instance = _instance }

/**
 * Get the balance held by a uuid
 * @param _uuid integer: the index code used to identify uniqueID's internally
 * @returns the balance held as a vanilla JS number type 
 **/ 
exports.balance = async (_uuid) => {
    let ret = await this.instance.itemSerial()
    return ret.toNumber()
}