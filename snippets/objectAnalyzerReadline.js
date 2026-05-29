// NOT USED: no longer have to read line by line
/**
 * Analyzes all properties (including non-enumerable properties except for those which use Symbol) 
 * found directly in a given object.
    * @param {*} object to analyze
    * @param {*} topLevelArray array to hold the top level properties
    * @param {*} totalsArray array to hold totals properties
 */
const analyzeProperties = (rawObj,topLevelArray, totalsArray)  =>{
    //Create an id for the top level object using the day and user_id properties
    const rawObjId = `${rawObj.day}-${rawObj.user_id}`;
    //Get the properties
    const topLevelProps = Object.getOwnPropertyNames(rawObj);
    //Add a new top level object to the top level array, with an id equal to the current length of the array
    let newTopLevelObj = {id: rawObjId}
    topLevelArray.push(newTopLevelObj);

    let val;
    topLevelProps.forEach(topLevelProp => {
        val = rawObj[topLevelProp];
        if (val instanceof Array) {
            let newTotalsObj = {top_level_obj: rawObjId, "totals_by": topLevelProp.replace(/^totals_by_/, '')};
            totalsArray.push(newTotalsObj);
             //add the totals properties to the new totals object in the
            val.forEach((totalsElement, i) => {
                const totalsProps = Object.getOwnPropertyNames(totalsElement);
                totalsProps.forEach(totalsProp => {
                    let totalsVal = totalsElement[totalsProp];
                    if (!(totalsVal instanceof Object)) {
                        newTotalsObj[totalsProp] = totalsVal;
                    } 
                });
            });
        }
        else if (!(val instanceof Object)) {
            newTopLevelObj[topLevelProp] = val;
        }
    });
}
	 
 module.exports = {
    analyzeProperties: analyzeProperties
 }