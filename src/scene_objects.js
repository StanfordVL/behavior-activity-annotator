const activitiesToRoomsObjects = require('./activity_to_rooms_objects.json')

export let allRooms = new Set()
for (const [_, roomEntries] of Object.entries(activitiesToRoomsObjects)) {
    console.log(roomEntries)
    for (const room of Object.keys(roomEntries)) {
        allRooms.add(room)
    }
}

export let sceneObjects = ["wall",
"floor",
"ceiling",
"bathtub", 
"bed", 
"bench", 
"cabinet",
"carpet", 
"chair", 
"chest", 
"coffee_table", 
"console_table", 
"cooktop", 
"counter", 
"crib", 
"dishwasher", 
"door", 
"dryer", 
"fence", 
"floor_lamp", 
"fridge", 
"grandfather_clock", 
"guitar", 
"heater", 
"microwave", 
"mirror", 
"office_chair",
"oven",
"piano",
"picture", 
"pool_table", 
"range_hood", 
"shelf", 
"shower", 
"sink", 
"sofa", 
"sofa_chair", 
"speaker_system", 
"stool", 
"stove", 
"table", 
"toilet", 
"towel_rack", 
"treadmill", 
"tv", 
"washer", 
"window"]

