const fs = require('fs')
const utils = require('./utils');

const COLUMN_SEPARATOR = ",";
const PATH_SEPARATOR = "/";

/**
 * 
 * @param {*} outputArray 
 * @param {*} outputFilePath 
 * @param {*} sort 
 */
const writeToFile = (outputArray,outputFilePath) =>{
    var columns = "id,diagram,c4Application,c4Name,c4Container,c4Parent,"
     +  "c4RelSource,c4RelTarget,c4RelIsTargetOf,c4RelIsSourceOf,c4Path,c4Technology,c4Type,c4Description";
    utils.writeToFile(outputArray,outputFilePath,columns.split(COLUMN_SEPARATOR));
}

/**
 * Analyzes all properties (including non-enumerable properties except for those which use Symbol) 
 * found directly in a given object.
  * @param {*} obj 
  * obj.mxfile.diagram[1].mxGraphModel[0].root[0].object[1].$.c4Type
 * @param {*} path 
 */
const analyzeProperties = (outputArray,obj)  =>{

    const diagrams = obj.mxfile.diagram;

    diagrams.forEach (d => {
        var elements = d.mxGraphModel[0].root[0].object;
        if(elements) {
            elements.forEach (e => {
                if(e.$.c4Type) {
                    var c4Element = {
                        diagram:  d.$.name,
                        id: e.$.id,
                        parentId: "",
                        parentElement: undefined,
                        c4Name: e.$.c4Name, 
                        c4Application: e.$.c4Application, 
                        c4Container: e.$.c4Container,
                        c4Parent: e.$.c4Parent,
                        c4Path: e.$.c4Path,
                        c4Description: e.$.c4Description, 
                        c4Technology: e.$.c4Technology, 
                        c4Type: e.$.c4Type,
                        c4RelTarget: e.mxCell[0].$.target,
                        c4RelSource: e.mxCell[0].$.source,
                        c4RelIsTargetOf:[],
                        c4RelIsSourceOf: []
                    };

                    //Try to ensure a name
                    if(!c4Element.c4Name) c4Element.c4Name = "NAME MISSING! Type:" + c4Element.c4Type
                    if(!c4Element.c4Name) c4Element.c4Name = "NAME MISSING! Technology:" + c4Element.c4Technology
                    c4Element.c4Path = PATH_SEPARATOR + c4Element.c4Name

                    var geometry = e.mxCell[0].mxGeometry[0].$;
                    c4Element.x = parseInt(geometry.x); 
                    c4Element.y= parseInt(geometry.y);  
                    c4Element.width= parseInt(geometry.width);  
                    c4Element.height= parseInt(geometry.height); 
                    outputArray.push(c4Element);
                }

            });
        }
   });

   //Links the parents
   linkParents(outputArray);

   //Links the relationships
   linkRelationships(outputArray);
}

const findElement = (outputArray,id) =>{
    if(!id) return;
    for (let i = 0; i < outputArray.length; i++) {
        const element = outputArray[i];
        if (element.id == id)
            return element;
    }
}

const linkRelationships = (outputArray) =>{
    outputArray.forEach(element => {
        if(element.c4Type === "Relationship"){
            var source = findElement(outputArray,element.c4RelSource);
            var target = findElement(outputArray,element.c4RelTarget);
            if (source && target) {
                source.c4RelIsSourceOf.push(element.c4Description + PATH_SEPARATOR + target.c4Name);
                target.c4RelIsTargetOf.push(source.c4Name + PATH_SEPARATOR + element.c4Description );
            }

        }
    });
      
    //Set paths after parents
    outputArray.forEach(element => {
        let parents = [];
        parent = element.parentElement;
        while (parent) {
            parents.push(parent);
            parent = parent.parentElement;
        }
        parents.reverse();
        parents.forEach(parent => {
            element.c4Path = parent.c4Path + PATH_SEPARATOR + element.c4Name;
        });
        console.log(element.c4Path);
    });
 }

const linkParents = (outputArray) =>{
    outputArray.forEach(element => {
        for (let i = 0; i < outputArray.length; i++) {
            const child = outputArray[i];
            isInside(element,child);
        }
    });
      
    //Set paths after parents
    outputArray.forEach(element => {
        let parents = [];
        parent = element.parentElement;
        while (parent) {
            parents.push(parent);
            parent = parent.parentElement;
        }
        parents.reverse();
        parents.forEach(parent => {
            element.c4Path = parent.c4Path + PATH_SEPARATOR + element.c4Name;
        });
        console.log(element.c4Path);
    });
 }

const isInside = (outer, inner) => {
    if (outer.diagram != inner.diagram)
        return false; // remember there will be multiple diagrmas

    if ((outer.x < inner.x) && ((outer.x + outer.width) > inner.x )) {
        if ((outer.y < inner.y) && ((outer.y + outer.height) > inner.y )) {
            //Check if existing parent is inside this new outer element
            if(inner.parentElement && isInside(outer,inner.parentElement))
            {
                return false;
            }
            else {
                inner.c4Parent = outer.c4Name;
                inner.parentElement = outer;
                console.log(outer.c4Name + " is parent of " + inner.c4Name);
            }
            return true;
        }
    }
}
	 
 module.exports = {
    analyzeProperties: analyzeProperties,
    linkParents: linkParents,
    writeToFile : writeToFile

 }