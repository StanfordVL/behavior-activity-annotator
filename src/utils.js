import { blocklyNameToPDDLName,
         detectObjectInstanceRe,
         objectInstanceRe,
         getPlacementsRe,
         sceneSynsets,
         detectObjectInstanceAndCategoryRe,
         sceneObjectLabelWithRoomRe
          } from "./constants.js"


// OBJECT UTILS 

export function isCategory(objectLabel) {
    /**
     * @param {string} objectLabel - objectLabel being checked for being an instance or category
     * @returns {boolean} - true if objectLabel is a category else false 
     */
    return (objectLabel.match(objectInstanceRe).length === 0)
}

export function getCategoryFromLabel(objectLabel) {
    /**
     * @param {string} objectLabel - objectLabel being turned into or preserved as category
     * @returns {string} - category of this objectLabel 
     */
    let objectCategory = objectLabel
    if (objectLabel.match(objectInstanceRe) || objectLabel.match(sceneObjectLabelWithRoomRe)) {
        objectCategory = objectLabel.split("_").slice(0, -1).join("_")
    }
    return objectCategory 
}

export function getPlacements(conditions, objectInstance) {
    /**
     * @param {string} conditions - conditions being checked for placements of a certain object instance
     * @param {string} objectInstance - object instance term whose placements will be detected
     * @return {list<string>} list of strings that are placements of objectInstance
     */
    // const placementMatchString = `\\((ontop|nextto|inside|under) (${objectInstance} \\??${detectObjectInstanceRe.source}|\\??${detectObjectInstanceRe.source} ${objectInstance})\\)`
    // const placementRegex = new RegExp(placementMatchString, 'g')
    const placements = conditions.match(getPlacementsRe(objectInstance))
    return placements
}


// BLOCK CODE UTILS 

export function convertName(name) {
    if (name in blocklyNameToPDDLName) {
        return (blocklyNameToPDDLName[name])
    } else {
        return (name)
    }
}

export function detectObjectInstances(code) {
    const detectedObjectInstances = code.match(detectObjectInstanceRe)
    return detectedObjectInstances
}

export function createObjectsList(initialConditions) {
    const detectedObjectInstances = detectObjectInstances(initialConditions) 
    let objectList = ''
    
    if (detectedObjectInstances !== null) {           
        let objectToCategory = {}
        for (let object of detectedObjectInstances) {
            // const category = object.replace(/[0-9]+/, '')
            const category = getCategoryFromLabel(object)
            if (category in objectToCategory) {
                objectToCategory[category].add(object)
            } else {
                objectToCategory[category] = new Set([object])
            }
        }

        for (const [category, objects] of Object.entries(objectToCategory)) {
            const sortedObjects = Array.from(objects).sort()
            objectList += '\t'
            objectList += sortedObjects.join(' ')
            objectList += ` - ${category}\n`
        }
    }
    objectList = `(:objects\n ${objectList})`
    return objectList
}

export function generateDropdownArray(labels) {
    let dropdownArray = []
    for (const label of labels) {
        if ((label === "select an adjective") || (label === "select an object")) {
            dropdownArray.push([label, ""])
        } else {
            dropdownArray.push([label, label.toUpperCase()])
        }
    }
    return dropdownArray
}

export function addAgentStartLine(room, code) {
    const codeElements = code.split(" (inroom")
    return codeElements[0] + ` (agentstart ${room}) (inroom` + codeElements.slice(1, -1).join(" (inroom")
}

export class ObjectOptions {
    constructor(selectedObjects) {
        this.selectedObjects = selectedObjects
    }

    createDemotedRoomsMap() {
        let demotedRoomsMap = {}

        for (let [category, number] of Object.entries(this.selectedObjects)) {
            if (category.includes(' (')) {
                let [pureLabel, room] = category.split(' (')
                room = ' (' + room
                if (!(pureLabel in demotedRoomsMap)) {
                    demotedRoomsMap[pureLabel] = {}
                }
                demotedRoomsMap[pureLabel][room] = number
            } else {
                demotedRoomsMap[category] = number
            }
        }
        return demotedRoomsMap
    }

    getRoomIndices(demotedRoomsMap, pureLabel) {
        let startIndex = 0
        let roomsToIndices = {}
        for (let room of Object.keys(demotedRoomsMap[pureLabel]).sort()) {
            roomsToIndices[room] = Array.from({ length: demotedRoomsMap[pureLabel][room]}, (_, i) => i + startIndex)
            startIndex += demotedRoomsMap[pureLabel][room]
        }
        return roomsToIndices 
    }

    getInstancesCategories() {
        const demotedRoomsMap = this.createDemotedRoomsMap()
        let objectInstanceLabels = [['select an object', 'null']]
        let instanceToCategory = {'null': 'null'}

        for (const [pureLabel, value] of Object.entries(demotedRoomsMap)) {
            if (typeof value !== "number") {

                // Create indices for each room that don't overlap, going in alphabetical order of rooms
                const roomsToIndices = this.getRoomIndices(demotedRoomsMap, pureLabel)
                for (const room of Object.keys(roomsToIndices).sort()) {
                    const instanceIndices = roomsToIndices[room]
                    
                    for (let instanceIndex of instanceIndices) {
                        let instanceLabel = pureLabel + "_" + (instanceIndex + 1).toString() + room
                        objectInstanceLabels.push([instanceLabel, instanceLabel])
                        instanceToCategory[instanceLabel] = pureLabel
                        instanceToCategory[pureLabel] = pureLabel
                    }
                }

            } else {
                for (let instanceIndex = 0; instanceIndex < value; instanceIndex++) {
                    let instanceLabel = pureLabel + "_" + (instanceIndex + 1).toString()
                    objectInstanceLabels.push([instanceLabel, instanceLabel])
                    instanceToCategory[instanceLabel] = pureLabel
                    instanceToCategory[pureLabel] = pureLabel
                }
            }
        }
        let instanceCategoryLabels = objectInstanceLabels.concat(this.getCategories().slice(1))
        return ([instanceCategoryLabels, instanceToCategory])
    }

    getCategories() {
        const demotedRoomsMap = this.createDemotedRoomsMap()
        let categoryLabels = [['select a category', 'null']]
        for (const [pureLabel, value] of Object.entries(demotedRoomsMap)) {
            if (typeof value !== "number") {
                for (const room of Object.keys(value)) {
                    if (demotedRoomsMap[pureLabel][room] > 0) {
                        categoryLabels.push([ pureLabel, pureLabel ])
                        break
                    }
                }
            } else {
                if (value > 0) {
                    categoryLabels.push([ pureLabel, pureLabel ])
                }
            }
        }
        return categoryLabels
    }
}


// CODE CORRECTNESS UTILS 

export function checkNulls(conditions) {
    return conditions.includes("null")
}

export function checkEmptyInitialConditions(initialConditions) {
    /**
     * Reports whether the initialConditions are empty or not 
     * 
     * @param {String} initialConditions - initialConditions being checked for emptiness
     * @returns {Boolean} - true if initialConditions are empty else false 
     */
    return initialConditions.match("\\(:init( )+\\(inroom") !== null
}

export function checkCompletelyUnplacedAdditionalObjects(conditions) {
    /**
     * Reports whether for every additional object mentioned in the conditions, if it is in any 
     * placement condition. Only guaranteed correct for initial conditions that have no categories. 
     * 
     * @param {String} conditions - string conditions being checked for additional objects that are 
     *                              not in any placement condition
     * @returns {Boolean} true if there are additional objects that are not in any placement 
     */
    const detectedObjectInstances = detectObjectInstances(conditions) 
    const rawPlacements = conditions.match(getPlacementsRe())
    if (rawPlacements == null) {
        return true 
    }
    for (const objectInstance of detectedObjectInstances) {
        if (sceneSynsets.includes(getCategoryFromLabel(objectInstance))) {
            continue
        }
        let objectPlaced = false
        for (const placement of rawPlacements) {
            if (placement.match(objectInstance) != null) {
                objectPlaced = true
                break
            }
        }
        if (!objectPlaced) {
            return true
        }
    }
    return false
}

export function checkTransitiveUnplacedAdditionalObjects(conditions) {
    /**
     * Reports whether for every placement in the conditions, if the second object is an additional object, 
     *      then the second object is transitively placed relative to a scene object. 
     * It's also true that the first object has to be an additional object and that if the second object is 
     *      a scene object, then relation is allowed for that scene object, but these should be guaranteed by 
     *      the interface.
     * Only guaranteed correct for initial conditions that have no categories. 
     * 
     * @param {String} conditions - string conditions being checked for additional objects that are unplaced 
     *                              even transitively
     * @returns {Boolean} true if there are unplaced additional objects, else false 
     */
    if (checkEmptyInitialConditions(conditions)) {
        return false 
    }
    if (checkCompletelyUnplacedAdditionalObjects(conditions)) {
        return true 
    }
    const rawPlacements = conditions.match(getPlacementsRe())
    let placements = []
    // drop parentheses
    for (const placement of rawPlacements) {
        const [__, object1, object2] = placement.slice(1, -1).split(" ")
        placements.push([object1, object2])
    }

    let placedPairs = {}
    let leftoverPlacements = []
    let currentNumHangingPlacements 
    let newNumHangingPlacements

    // round 1: for each placement, if second object is a scene object, put the pair in placedPairs. Else, 
    //          put the placement in the new queue 
    while (placements.length > 0) {
        const placement = placements.pop()
        const [object1, object2] = placement
        if (sceneSynsets.includes(getCategoryFromLabel(object2))) {
            placedPairs[object1] = object2
        } else {
            leftoverPlacements.push(placement)
        }
    }
    currentNumHangingPlacements = placements.length
    newNumHangingPlacements = leftoverPlacements.length
    placements = leftoverPlacements
    leftoverPlacements = []

    // round >1: for each placement, if the second object is a key in placedPairs, put the first object as 
    //          a key in placedPairs, mapped to the second object's value. If it is not in placedPairs, 
    //          put the placement in the new queue. 
    while (currentNumHangingPlacements !== newNumHangingPlacements) {
        currentNumHangingPlacements = placements.length
        while (placements.length > 0) {
            const placement = placements.pop()
            const [object1, object2] = placement 
            if (object2 in placedPairs) {
                placedPairs[object1] = placedPairs[object2]
            } else {
                leftoverPlacements.push(placement)
            }
        }
        newNumHangingPlacements = leftoverPlacements.length
        placements = leftoverPlacements
        leftoverPlacements = []
    }

    return (newNumHangingPlacements !== 0)
}

export function checkNegatedPlacements(conditions) {
    /**
     * Check conditions for presence of negated placement conditions (binary predicates, 
     * i.e. kinematic predicates)
     * 
     * @param {String} conditions - conditions being checked for negated placements
     * @return {Boolean} true if negated placements exist else false 
     */
    const negatedPlacementsRe = new RegExp(`\\(not ${getPlacementsRe().source}\\)`, "g")
    const negatedPlacements = conditions.match(negatedPlacementsRe)
    return negatedPlacements != null
}

export function checkCategoriesExist(conditions) {
    /**
     * Check conditions for presence of categories (i.e. objects that are not instances)
     * 
     * @param {String} conditions - conditions being checked for presence of categories
     * @returns {Boolean} true if categories exist else false 
     */
    
    const objectTerms = conditions.match(detectObjectInstanceAndCategoryRe)
    if (objectTerms != null) {
        for (let objectTerm of objectTerms) {
            if (objectTerm.match(objectInstanceRe) == null) {
                return true 
            }
        }
    } else {
        return false 
    }
}
