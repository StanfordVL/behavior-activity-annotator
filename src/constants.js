import React from "react"
import Modal from "react-bootstrap/Modal"

// ACTIVITIES, ROOMS, SCENE OBJECTS CONSTANTS

export const binaryPredicates = ["ontop", "nextto", "inside", "under", "touching", "onfloor"]
export const binaryPredicatesReadable = ["on top of", "next to", "inside", "under", "touching"]
export const initBinaryPredicatesAdditionalReadable = ["on top of"]
export const initBinaryPredicatesSceneReadable = ["on top of", "inside"]

export const blocklyNameToPDDLName = Object.assign(
    {}, ...binaryPredicatesReadable.map((readable, i) => (
        {[readable]: binaryPredicates[i]}
    )))

const activitiesToRoomsObjects = require('./data/activity_to_rooms_objects.json')

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
export const sceneObjectLabelWithRoomRe = new RegExp(objectInstanceRe.source.slice(0, -1) + " \\([A-Za-z_]+\\)$", "g")

export function getPlacementsRe(objectInstance=null) {
    let instanceRe = objectInstance
    if (objectInstance == null) {
        instanceRe = detectObjectInstanceRe.source
    }
    const placementsStringSegment = binaryPredicates.join("|")
    // const placementsRe =`\\((ontop|nextto|inside|under) (${instanceRe} \\??${detectObjectInstanceRe.source}|\\??${detectObjectInstanceRe.source} ${instanceRe})\\)`
    const placementsRe =`\\((${placementsStringSegment}) (${instanceRe} \\??${detectObjectInstanceRe.source}|\\??${detectObjectInstanceRe.source} ${instanceRe})\\)`
    return new RegExp(placementsRe, "g")
}
export const initialDescriptionsRe = new RegExp(
     `\\([A-Za-z_]+ ${detectObjectInstanceRe.source}\\)`, 
     "g"
)

export const dirtyFloorRe = new RegExp("\\((stained|dusty) floor.n.01_[0-9]+\\)", "g")
export const notDirtyFloorRe = new RegExp(`\\(not ${dirtyFloorRe.source}\\)`, "g")


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
export const kinematicDropdownGeneratorsGoal = Object.assign({}, ...Object.entries(allowedSamplings).map(
    ([object, kinematicDescriptors], _) => (
        {[object]: () => [['select an adjective', '']].concat(kinematicDescriptors)}
    )
))
export const kinematicDropdownGeneratorsInit = Object.assign({}, ...Object.entries(allowedSamplings).map(
    ([object, kinematicDescriptors], _) => (
        {[object]: () => [["select an adjective", ""]].concat(kinematicDescriptors.filter(
            descriptor => initBinaryPredicatesSceneReadable.includes(descriptor[0])
        ))}
    )
))

export const sentenceConstructorColor = "#76912F";
export const basicSentenceColor = "#D96704";
export const rootColor = "#731D45"


// EXTERNAL REQUESTS CONSTANTS 

const airtableUrl = "https://api.airtable.com/v0/apppX4DOdUUFg6r2q"
const igGcpVmUrl = "http://34.122.186.206:8000"                          // TODO replace with production? Static IP?
export const airtableResultsUrl = airtableUrl + "/Results"
export const airtableSavesUrl = airtableUrl + "/Saves"
export const igibsonGcpVmSetupUrl = igGcpVmUrl + "/setup"
export const igibsonGcpVmCheckSamplingUrl = igGcpVmUrl + "/check_sampling"
export const igibsonGcpVmTeardownUrl = igGcpVmUrl + "/teardown"


export class ServerErrorModal extends React.Component {
    constructor(props) { super(props) }

    onHide() { this.props.onHide() }

    render() {
        return (
            <div>
                <Modal
                    onHide={() => this.onHide()}
                    show={this.props.show}
                >
                    <Modal.Header closeButton>
                        <Modal.Title as="h5">Server error</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p>
                            Let Sanjana know:
                            <ul>
                                <li>that there was a server error</li>
                                <li>whether it happened before or after you clicked "Check feasibility" for the first time</li>
                            </ul>
                            Then feel free to move to the next step. 
                        </p>
                    </Modal.Body>
                </Modal>
            </div>
        )
    }
}
