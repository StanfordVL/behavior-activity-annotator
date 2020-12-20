// TODO get these from imports 

const objects = ["null", "apple", "orange", "apricot", "lamp", "desk", "chair", "shelf"]
const descriptors = [
    [],
    [
        ['Apple desc 1', 'appleDesc1'],
        ['Apple desc 2', 'appleDesc2'],
        ["cooked", "cooked"]
    ],
    [
        ['Orange desc 1', 'orangeDesc1'],
        ['Orange desc 2', 'orangeDesc2']
    ],
    [
        ['Apricot desc 1', 'apricotDesc1']
    ],
    [
        ['Lamp desc 1', 'lampDesc1']
    ],
    [
        ['Desk desc 1', 'deskDesc1']
    ],
    [
        ['Chair desc 1', 'chairDesc1']
    ],
    [
        ['shelf desc 1', 'shelfDesc1']
    ]
]


export const dropdownGenerators = Object.assign({}, ...objects.map((object, i) => (
    {[object]: () => [['select an adjective', '']].concat(descriptors[i])}
)))

