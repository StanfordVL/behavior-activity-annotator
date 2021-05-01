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
    /**
     * Detects all object instances in code, returns list of instances.
     * If there are no instances, returns empty list 
     * 
     * @param {String} code - code in which object instances are being 
     *                        detected 
     * @return {Array} detected object instances 
     */
    const detectedObjectInstances = code.match(detectObjectInstanceRe)
    if (detectedObjectInstances === null) {
        return []
    } else {
        return detectedObjectInstances
    }
}

export function createObjectsList(initialConditions) {
    const detectedObjectInstances = detectObjectInstances(initialConditions) 
    let objectList = ''
    
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
    /**
     * Add agent start lines to <code> with agent placed in <room>.
     * Following rules: 
     *      If the code has no floor in the given room, add a predicate adding a 
     *          floor with the next instance index to that room. 
     *      Add an onfloor condition to the agent and the floor of that room
     * 
     * @param {String} room - room in which agent should be placed 
     * @param {String} code - code to which agent start lines should be added
     * @return {String} - copy of code with agent start lines added
     */
    let newCode = code 
    const floorInRoomRegex = new RegExp(`\\(inroom floor.n.01_[0-9]+ [a-z]+\\)`, "g")
    const floorInRoomPlacements = floorInRoomRegex.test(newCode) ? newCode.match(floorInRoomRegex) : []
    const roomRegex = new RegExp(room, "g")

    // Go through placements 
    let floorLabelNumbers = [0]
    for (let floorPlacement of floorInRoomPlacements) {
        if (roomRegex.test(floorPlacement)) {
            console.log("FLOOR PLACEMENT:", floorPlacement)
            const floorLabel = floorPlacement.split(" ")[1]
            console.log("CODE ITSELF:", newCode)
            return newCode.slice(0, -1) + ` (onfloor agent.n.01_1 ${floorLabel}))`  
        } 
        // Else, get its instance number 
        else {
            console.log("FLOOR PLACEMENT WHEN NOT IN ROOM:", floorPlacement)
            floorLabelNumbers.push(parseInt(floorPlacement.split(" ")[1].split("_").slice(-1)))
        }
    }

    // If the agent start room doesn't have a floor, add it in 
    const newFloorLabel = `floor.n.01_${Math.max(...floorLabelNumbers) + 1}`
    newCode = newCode.slice(0, -1) 
    newCode += ` (inroom ${newFloorLabel} ${room})` 
    newCode += ` (onfloor agent.n.01_1 ${newFloorLabel}))`
    return newCode
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

    getInstances() {
        const demotedRoomsMap = this.createDemotedRoomsMap()
        let objectInstanceLabels = [["select an object", "null"]]
        let instanceToCategory = {"null": "null"}

        for (const [pureLabel, value] of Object.entries(demotedRoomsMap)) {
            if (typeof value !== "number") {

                // Create indices for each room that don't overlap, going in alphabetical
                // order of rooms 
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
        return ([objectInstanceLabels, instanceToCategory])
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

export function checkAdditionalObjectsPresent(conditions) {
    /**
     * Reports whether the conditions have any additional objects at all or not 
     * 
     * @param {String} conditions - string conditions to check 
     * @returns {Boolean} true if there are additional objects in the string else false 
     */
    const detectedObjectInstances = detectObjectInstances(conditions)
    let detectedAdditionalObjectInstances = detectedObjectInstances.filter(
        detectedObjectInstance => !sceneSynsets.includes(getCategoryFromLabel(detectedObjectInstance))
    )
    return detectedAdditionalObjectInstances.length !== 0
}

export function checkCompletelyUnplacedAdditionalObjects(conditions) {
    /**
     * Reports whether for every additional object mentioned in the conditions, if it is in any 
     * placement condition. Only guaranteed correct for initial conditions that have no categories. 
     * NOTE ASSUMES that there is at least one additional object in the code 
     * 
     * @param {String} conditions - string conditions being checked for additional objects that are 
     *                              not in any placement condition
     * @returns {Boolean} true if there are additional objects that are not in any placement 
     */
    const detectedObjectInstances = detectObjectInstances(conditions) 
    const rawPlacements = conditions.match(getPlacementsRe())

    // If there are no placements, everything left will necessarily be unplaced
    if (rawPlacements == null) {
        return true 
    }

    // Check if the additional object is in no placements 
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
    if (!checkAdditionalObjectsPresent(conditions)) {
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

// export function checkTermPresence(conditions, term) {
//     /**
//      * Check conditions for any instances of given term
//      * 
//      * @param {String} conditions 
//      */

// }

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


// FEASIBILITY CHECKER FEEDBACK UTILS 

export function getReadableFeedback(feedback) {
    /**
     * Turn raw feedback from feasibility checker into human-readable feedback. 
     * 
     * @param {Array[N]<Array[4]<String>>} feedback - array of arrays of strings, format [
     *                                  init_success (yes/no), 
     *                                  goal_success (yes/no), 
     *                                  init_feedback (sentence), 
     *                                  goal_feedback (sentence)
     *                              ]
     */
    const [initSuccess, goalSuccess, initFeedback, goalFeedback] = feedback[0]
    let initFeedbackDisplay 
    let goalFeedbackDisplay
    if (initSuccess === "yes") {
        initFeedbackDisplay = <p>The initial conditions are feasible!</p>
    } else if (initSuccess === "no") {
        initFeedbackDisplay = <div>{initFeedback.split("\n").map(part => <p>{part}</p>)}</div>
    } else if (initSuccess === "untested") {
        initFeedbackDisplay = <p>The initial conditions have not yet been checked.</p>
    }
    if (goalSuccess === "yes") {
        goalFeedbackDisplay = <p>The goal conditions are feasible!</p>
    } else if (goalSuccess === "no") {
        goalFeedbackDisplay = <div>{goalFeedback}</div>     // TODO make better feedback
    } else if (goalSuccess === "untested") {
        goalFeedbackDisplay = <p>The goal conditions have not yet been checked.</p>
    }

    const fullFeedback = 
        <div>
            <p><b>Initial conditions:</b></p>
            {initFeedbackDisplay}
            <p><b>Goal conditions:</b></p>
            {goalFeedbackDisplay}
        </div>
    return fullFeedback
}