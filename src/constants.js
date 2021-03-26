// ROOMS AND SCENE OBJECTS

const activitiesToRoomsObjects = require('./activity_to_rooms_objects.json')

export let allRooms = new Set()
for (const [_, roomEntries] of Object.entries(activitiesToRoomsObjects)) {
    console.log(roomEntries)
    for (const room of Object.keys(roomEntries)) {
        allRooms.add(room)
    }
}

export let sceneObjectsNamesToSynsets = {
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


// CODE PROCESSING STRINGS AND UTILS

export const objectInstanceRe = "[A-Za-z-_]+\.n\.[0-9]+_[0-9]+$"
export const objectCategoryRe = "[A-Za-z-_]+\.n\.[0-9]+"   // also catches instances 

function isCategory(objectLabel) {
    /**
     * @param {string} objectLabel - objectLabel being checked for being an instance or category
     * @returns {boolean} - true if objectLabel is a category else false 
     */
    let objectInstanceRegExp = new RegExp(objectInstanceRe, "g")
    return (objectLabel.match(objectInstanceRegExp).length === 0)
}

export function getCategoryFromLabel(objectLabel) {
    /**
     * @param {string} objectLabel - objectLabel being turned into or preserved as category
     * @returns {string} - category of this objectLabel 
     */
    let objectInstanceRegExp = new RegExp(objectInstanceRe, "g")
    let objectCategory = objectLabel
    if (objectLabel.match(objectInstanceRegExp)) {
        objectCategory = objectLabel.split("_").slice(0, -1).join("_")
    } 
    return objectLabel 
}


// BLOCK DRAWER ELEMENTS  

var objToDesc = require('./synsets_to_descriptors.json')
objToDesc["null"] = []

export const dropdownGenerators = Object.assign({}, ...Object.entries(objToDesc).map(
    ([object, descriptors], _) => (
        {[object]: () => [['select an adjective', '']].concat(descriptors)}
    )
))

export const blocklyNameToPDDLName = {
    'on top of': 'ontop',
    'next to': 'nextto'
}

export const sentenceConstructorColor = "#76912F";
export const basicSentenceColor = "#D96704";
export const rootColor = "#731D45"
