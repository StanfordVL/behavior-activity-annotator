var objToDesc = require('./objects_to_descriptors.json')
objToDesc["null"] = []

export const dropdownGenerators = Object.assign({}, ...Object.entries(objToDesc).map(
    ([object, descriptors], _) => (
        {[object]: () => [['select an activity', '']].concat(descriptors)}
    )
))

export const blocklyNameToPDDLName = {
    'on top of': 'ontop',
    'next to': 'nextto'
}

export const sentenceConstructorColor = "#76912F";
export const basicSentenceColor = "#D96704";
export const rootColor = "#731D45"
