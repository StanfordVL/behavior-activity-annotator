// TODO get these from imports 

const objects = ["null", "apple", "orange", "apricot", "lamp", "desk", "chair", "shelf"]
const descriptors = [
    [],
    [
        ['scrubbed', 'scrubbed'],
        ["cooked", "cooked"]
    ],
    [
        ['scrubbed', 'scrubbed'],
        ['burnt', 'burnt']
    ],
    [
        ['dusted', 'dusted']
    ],
    [
        ['broken', 'broken']
    ],
    [
        ['dusted', 'dusted']
    ],
    [
        ['scrubbed', 'scrubbed']
    ],
    [
        ['open', 'open']
    ]
]


export const dropdownGenerators = Object.assign({}, ...objects.map((object, i) => (
    {[object]: () => [['select an adjective', '']].concat(descriptors[i])}
)))

