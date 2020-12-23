// TODO get these from imports 

const objects = ["null", "apple", "orange", "apricot", "lamp", "desk", "chair", "shelf", "table", "rag", "soap", "water", "toy"]
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
    ],
    [
        ["dusty", "dusty"],
        ["scrubbed", "scrubbed"]
    ],
    [
        ["soaked", "soaked"]
    ],
    [
        ["open", "open"]
    ],
    [
        ["open", "open"]
    ],
    [
        ["dusty", "dusty"]
    ]
]


export const dropdownGenerators = Object.assign({}, ...objects.map((object, i) => (
    {[object]: () => [['select an adjective', '']].concat(descriptors[i])}
)))

