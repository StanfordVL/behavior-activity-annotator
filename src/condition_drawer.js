import React from 'react
import BlocklyDrawer, { Block, Category } from 'react-blockly-drawer'


export default class InitialConditionDrawer extends React.Component {
    render() {
        return (
            <BlocklyDrawer
                onChange={(code, workspace) => {console.log(code)}}
                language={Blockly.Python}
                appearance={{
                    categories: {
                        Root: {
                            colour: basicSentenceColor
                        }
                    }
                }}
            >

            </BlocklyDrawer>
        )
    }
}