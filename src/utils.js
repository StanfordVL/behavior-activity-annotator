import { blocklyNameToPDDLName,
         detectObjectInstanceRe,
         objectInstanceRe,
         getPlacementsRe
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
    if (objectLabel.match(objectInstanceRe)) {
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