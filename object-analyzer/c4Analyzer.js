/*
References:
C4: https://c4model.com/
Draw.io-C4: https://www.drawio.com/docs/diagram-types/c4-modelling/
Examples: https://medium.com/news-uk-technology/c4-model-a-better-way-to-visualise-software-architecture-df41e5ac57b8
- C4: https://c4model.com/
- Draw.io-C4: https://www.drawio.com/docs/diagram-types/c4-modelling/
- Examples: https://medium.com/news-uk-technology/c4-model-a-better-way-to-visualise-software-architecture-df41e5ac57b8


*/
const fs = require('fs')
const utils = require('./utils');

const PATH_SEPARATOR = "/";
const FLOW_SEPARATOR = "->";

/**
 * 
 * @param {*} outputArray 
 * @param {*} outputFilePath 
 * @param {*} sort 
 */
const writeToCsvFile = (outputArray,outputFilePath) =>{
    const columnNames = Object.getOwnPropertyNames(outputArray[0]);
    utils.writeToCsvFile(outputArray,outputFilePath,columnNames);

    const components = getComponents(outputArray);
    const componentColumnNames = Object.getOwnPropertyNames(components[0]);
    utils.writeToCsvFile(components,outputFilePath + "_components",componentColumnNames);

    const flows = getFlows(outputArray);
    const flowColumnNames = Object.getOwnPropertyNames(flows[0]);
    utils.writeToCsvFile(flows,outputFilePath + "_flows",flowColumnNames);

}

const getComponents = (outputArray)  =>{
    const components = [];
        outputArray.forEach(element => {   
        if(element.c4Type == "Relationship")
            return; //skip relationships
        var component = {
            Component: element.c4Name,
            Description: element.c4Type,
            Technology: element.c4Technology,
            CloudServiceType: element.c4CloudServiceType,
            Memory: element.c4Memory,
            CPU: element.c4CPU,
            Storage: element.c4Storage,
            Instances: element.c4Instances,
            IsTargetOf: element.c4RelIsTargetOf,
            IsSourceOf: element.c4RelIsSourceOf,
            Id: element.id,
            Diagram: element.diagram,
            C4Type: element.c4Type,
            Parent: element.c4Parent,
            Path: element.c4Path
        };
        components.push(component);
    });
    return components;
}

const getFlows = (outputArray)  =>{
    const flows = [];
        outputArray.forEach(element => {   
        if(element.c4Type != "Relationship" || (element.c4Name && element.c4Name.includes("Legend")))
            return; //skip non-relationships
        var flow = {
            Flow: element.c4Name,
            SourceName: element.c4RelSourceName,
            TargetName: element.c4RelTargetName,
            Description: element.c4Description,
            Technology: element.c4Technology,
            Protocol: element.c4Protocol,
            InputStructure: element.c4InputStructure,
            OutputStructure: element.c4OutputStructure,
            Format: element.c4Format,
            Trigger: element.c4Trigger,
            Volume: element.c4Volume,
            Id: element.id,
            Diagram: element.diagram,
            C4Type: element.c4Type,
            Path: element.c4Path
        };
        flows.push(flow);
    });
    return flows;
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
        if(!elements || d.$.name === "Toolbox") 
            return;//skip to next diagram if no elements (return is for the forEach loop, not the function)
        
        elements.forEach (e => {
            if(!e.$.c4Type) 
                return; //skip to next element if no c4Type (return is for the forEach loop, not the function)
            var c4Element = {
                diagram:  d.$.name,
                id: e.$.id,
                parentId: "",
                parentElement: undefined,
                c4Name: e.$.c4Name, 
                c4Type: e.$.c4Type,
                c4Parent: e.$.c4Parent,
                c4Path: e.$.c4Path,
                c4Description: e.$.c4Description, 
                c4Technology: e.$.c4Technology, 
                c4CloudServiceType: e.$.c4CloudServiceType, 
                c4Memory: e.$.c4Memory,
                c4CPU: e.$.c4CPU,
                c4Storage: e.$.c4Storage,
                c4Instances: e.$.c4Instances,
                c4RelSourceId: e.mxCell[0].$.source,
                c4RelSourceName: "",
                c4RelTargetId: e.mxCell[0].$.target,
                c4RelTargetName: "",
                c4RelIsTargetOf:[],
                c4RelIsSourceOf: [],
                c4Protocol: e.$.c4Protocol,
                c4InputStructure: e.$.c4InputStructure,
                c4OutputStructure: e.$.c4OutputStructure,
                c4Format: e.$.c4Format,
                c4Trigger: e.$.c4Trigger,
                c4Volume: e.$.c4Volume
            };

            //Try to ensure a name
            if(!c4Element.c4Name) c4Element.c4Name = "NAME MISSING! Type:" + c4Element.c4Type
            c4Element.c4Path = PATH_SEPARATOR + c4Element.c4Name

            var geometry = e.mxCell[0].mxGeometry[0].$;
            c4Element.x = parseInt(geometry.x); 
            c4Element.y= parseInt(geometry.y);  
            c4Element.width= parseInt(geometry.width);  
            c4Element.height= parseInt(geometry.height); 
            outputArray.push(c4Element);

        });

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
            var source = findElement(outputArray,element.c4RelSourceId);
            var target = findElement(outputArray,element.c4RelTargetId);
            
            if (source ) {
                element.c4RelSourceName = source.c4Name;
                if(target) {
                source.c4RelIsSourceOf.push(element.c4Name + FLOW_SEPARATOR + target.c4Name);
                } else
                { 
                    source.c4RelIsSourceOf.push(element.c4Name + FLOW_SEPARATOR + "TARGET NOT FOUND! id:" + element.c4RelTargetId);
                }
                
            } else {
                element.c4RelSourceName = "SOURCE NOT FOUND!";
            }
            
            if (target) {
                element.c4RelTargetName = target.c4Name;
                if (source) {
                    target.c4RelIsTargetOf.push(source.c4Name + FLOW_SEPARATOR + element.c4Name );
                } else {
                    target.c4RelIsTargetOf.push(element.c4Name + FLOW_SEPARATOR + "SOURCE NOT FOUND! id:" + element.c4RelSourceId  );
                }
            } else {
                element.c4RelTargetName = "TARGET NOT FOUND!";
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
    writeToCsvFile : writeToCsvFile

 }