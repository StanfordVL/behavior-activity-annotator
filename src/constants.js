// ACTIVITIES, ROOMS, SCENE OBJECTS CONSTANTS

// export const allActivities = Object.keys(require("./data/all_activity_hierarchies.json"))
const activitiesToRoomsObjects = require('./data/activity_to_rooms_objects.json')
// export const allActivities = Object.keys(activitiesToRoomsObjects)

export let allActivities = []
export let allRooms = new Set()
for (const [activity, roomEntries] of Object.entries(activitiesToRoomsObjects)) {
    allActivities.push(activity)
    for (const room of Object.keys(roomEntries)) {
        allRooms.add(room)
    }
}

const sceneObjectsNamesToSynsets = {
    "wall": "wall",
    "floor": "floor.n.01",
    "ceiling": "ceiling",
    "bathtub": "bathtub.n.01",
    "bed": "bed.n.01",
    "cabinet": "cabinet.n.01",
    "carpet": "rug.n.01",
    "chair": "chair.n.01",
    "chest": "chest.n.02",
    "coffee_table": "table.n.02",       // "coffee_table.n.01",
    "console_table": "table.n.02",      // "console_table.n.01",
    "counter": "countertop.n.01",
    "crib": "crib.n.01",
    "dishwasher": "dishwasher.n.01",
    "door": "door.n.01",
    "dryer": "dryer.n.01",
    "floor_lamp": "floor_lamp.n.01",
    "fridge": "electric_refrigerator.n.01",
    "grandfather_clock": "grandfather_clock.n.01",
    "heater": "heater.n.01",
    "microwave": "microwave.n.02",
    "mirror": "mirror.n.01",
    "office_chair": "chair.n.01",
    "oven": "oven.n.01",
    "piano": "piano.n.01",
    "picture": "photograph.n.01",
    "pool_table": "pool_table.n.01",
    "range_hood": "range_hood.n.01",
    "shelf": "shelf.n.01",
    "shower": "shower.n.01",
    "sink": "sink.n.01",
    "sofa": "sofa.n.01",
    "sofa_chair": "chair.n.01",      // TODO check
    "speaker_system": "loudspeaker.n.01",
    "stool": "stool.n.01",
    "stove": "stove.n.01", 
    "table": "table.n.02", 
    "toilet": "toilet.n.02",
    "towel_rack": "towel_rack.n.01",
    "treadmill": "treadmill.n.01",
    "tv": "television_receiver.n.01",
    "washer": "washer.n.03",
    "window": "window.n.01"
}

export const sceneObjects = Object.keys(sceneObjectsNamesToSynsets)
export const sceneSynsets = Object.values(sceneObjectsNamesToSynsets)
export function getSceneSynset(sceneObject) {
    return sceneObjectsNamesToSynsets[sceneObject]
}


// CODE PROCESSING CONSTANTS 

// NOTE the first two will match with terms that have inappropriate characters in the middle of them, e.g. "matter.n.%03_1".
//      Not sure how to fix this, but leaving it alone for now since that shouldn't ever happen.  
export const detectObjectInstanceRe = new RegExp("[A-Za-z-_]+\.n\.[0-9]+_[0-9]+", "g")
export const detectObjectInstanceAndCategoryRe = new RegExp("[A-Za-z-_]+\.n\.[0-9]+(_[0-9]+)?", "g")
export const objectInstanceRe = new RegExp("^[A-Za-z-_]+\.n\.[0-9]+_[0-9]+$", "g")
export const objectCategoryRe = new RegExp("^[A-Za-z-_]+\.n\.[0-9]+", "g")   // also catches instances 
export const instanceSplitRe = new RegExp("_[0-9]+$", "g")
export function getPlacementsRe(objectInstance=null) {
    let instanceRe = objectInstance
    if (objectInstance == null) {
        instanceRe = detectObjectInstanceRe.source
    }
    const placementsRe =`\\((ontop|nextto|inside|under) (${instanceRe} \\??${detectObjectInstanceRe.source}|\\??${detectObjectInstanceRe.source} ${instanceRe})\\)`
    return new RegExp(placementsRe, "g")
}
export const initialDescriptionsRe = new RegExp(
     `\\([A-Za-z_]+ ${detectObjectInstanceRe.source}\\)`, 
     "g"
)

// export function isCategory(objectLabel) {
//     /**
//      * @param {string} objectLabel - objectLabel being checked for being an instance or category
//      * @returns {boolean} - true if objectLabel is a category else false 
//      */
//     return (objectLabel.match(objectInstanceRe).length === 0)
// }

// export function getCategoryFromLabel(objectLabel) {
//     /**
//      * @param {string} objectLabel - objectLabel being turned into or preserved as category
//      * @returns {string} - category of this objectLabel 
//      */
//     let objectCategory = objectLabel
//     if (objectLabel.match(objectInstanceRe)) {
//         objectCategory = objectLabel.split("_").slice(0, -1).join("_")
//     } 
//     return objectCategory 
// }

// export function getPlacements(conditions, objectInstance) {
//     /**
//      * @param {string} conditions - conditions being checked for placements of a certain object instance
//      * @param {string} objectInstance - object instance term whose placements will be detected
//      * @return {list<string>} list of strings that are placements of objectInstance
//      */
//     // const placementMatchString = `\\((ontop|nextto|inside|under) (${objectInstance} \\??${detectObjectInstanceRe.source}|\\??${detectObjectInstanceRe.source} ${objectInstance})\\)`
//     // const placementRegex = new RegExp(placementMatchString, 'g')
//     const placements = conditions.match(getPlacementsRe(objectInstance))
//     return placements
// }


// BLOCK DRAWER CONSTANTS  

var objToDesc = require('./data/synsets_to_descriptors.json')
objToDesc["null"] = []

export const dropdownGenerators = Object.assign({}, ...Object.entries(objToDesc).map(
    ([object, descriptors], _) => (
        {[object]: () => [['select an adjective', '']].concat(descriptors)}
    )
))

var allowedSamplings = require("./data/allowed_samplings.json")
allowedSamplings["null"] = []
export const kinematicDropdownGenerators = Object.assign({}, ...Object.entries(allowedSamplings).map(
    ([object, kinematicDescriptors], _) => (
        {[object]: () => [['select an adjective', '']].concat(kinematicDescriptors)}
    )
))

export const blocklyNameToPDDLName = {
    'on top of': 'ontop',
    'next to': 'nextto'
}


export const sentenceConstructorColor = "#76912F";
export const basicSentenceColor = "#D96704";
export const rootColor = "#731D45"


// EXTERNAL REQUESTS CONSTANTS 

export const airtableSaveURL = 'https://api.airtable.com/v0/appIh5qQ5m4UMrcps/Saves'
export const airtableResultURL = 'https://api.airtable.com/v0/appIh5qQ5m4UMrcps/Results'
export const igibsonSamplerURL = 'http://34.72.242.229:8000/sample_feedback'        // TODO replace with production
