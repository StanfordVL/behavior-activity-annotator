import React from 'react'
import Card from 'react-bootstrap/esm/Card';
import Button from 'react-bootstrap/Button'
import ActivityEntryForm from './activity_entry_form';
import NameEntryForm from './name_entry_form'

import basic_unary_condition_image from './block_images/basic_unary_condition.png'
import basic_binary_condition_image from './block_images/basic_binary_condition.png'
import conjunction_image from './block_images/conjunction.png'
import disjunction_image from './block_images/disjunction.png'
import composed_example_image from './block_images/implication_conjunction_composed_example.png'
import negation_image from './block_images/negation.png'
import implication_image from './block_images/implication.png'
import universal_image from './block_images/universal.png'
import existential_image from './block_images/existential.png'
import quantified_combo_image from './block_images/quantified_composed_example.png'
import forn_image from './block_images/forn.png'
import forpairs_image from './block_images/forpairs.png'
import fornpairs_image from './block_images/fornpairs.png'
import cleantable_initial_condition from "./block_images/cleantable_initial_conditions.png"
import cleantable_goal_condition from './block_images/cleantable_goal_conditions.png'


export default class Introduction extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            activityHidden: true,
            sceneSelectHidden: true,
            activitySubmitted: false,
            nameSubmitted: false
        }
        this.onSeeActivity = this.onSeeActivity.bind(this)
        this.onSeeSceneSelection = this.onSeeSceneSelection.bind(this)
    };

    onSeeActivity() {
        this.setState({ activityHidden: false })
    }

    onNameSubmit() {
        this.setState({ nameSubmitted: true })
    }

    showInstructions() {
        return(
            <Card className="marginCard">
                <Card.Body>
                    <Card.Title as="h1">Defining household activities</Card.Title>
                    <Card.Text>
                        <p>Thank you for helping us with this annotation!</p>
                        <p>We highly recommend doing this with a full-screen browser window - it'll make it easier to see everything.</p>
                        <p>In this annotation we ask you to provide <b>initial and goal conditions</b> for a household activity. The <b>initial conditions</b> describe the state of the world before starting the activity: a room, all the relevant objects in the scene, their locations, and their states (dusty, open, cooked, etc.) The <b>goal conditions</b> describe the state of the world after the activity has been successfully performed - e.g. the new locations or states of the relevant objects.</p>
                        <p>To simplify the annotation process, we'll follow these steps:</p>
                        <ol type="disc">
                            <li>Set up the scene for the activity by selecting the relevant room, scene objects (generally types of furniture) that are already in our scenes, and additional objects (smaller things like food or toys) that aren't in the scene by default, but can be added.</li>
                            <li style={{ "marginTop": "10px" }}>Annotate the conditions using the objects we've selected in the prior step. </li> 
                        </ol>
                        <p>You cannot edit the room after you've chosen it, but you can edit your object selections, initial conditions, and goal conditions at any time, so feel free to change your mind and work on them in parallel.</p>
                        <p><b>Important note:</b> We are <b>not</b> asking you to tell us how to <em>perform</em> the activity - we aren't asking for the actions needed to get from the initial to the goal state. We're only asking for what the world looks like before someone has done it (initial conditions) and after it has been done (goal conditions).</p>
                        <p>We'll give more detailed instructions at each step. Before that, here's an example to give you a sense.</p>
                        <p style={{ "marginLeft": "20px" }}>Let's say the example activity is <b>clean a table surface</b>. This activity is relatively simple: for scene objects, we just need a table to clean off, shelves for storage, and a sink to be able to soak a rag to clean. For additional objects, we would want a rag, some soap, and a few generic items like toys to move off the table. Our initial conditions might look like</p>
                        <p style={{ "marginLeft": "40px" }}><img alt="Clean table surface - initial condition" src={cleantable_initial_condition} width="400"/></p>
                        <p style={{ "marginLeft": "20px" }}>The goal conditions might be</p>
                        <p style={{ "marginLeft": "40px" }}><img alt="Clean table surface - goal condition" src={cleantable_goal_condition} width="500"/></p>
                        <p>The above set of conditions is shorter than we'd expect for most of our tasks. We hope it's good minimal example to set you on the right track! Please submit your name, then click the button below to see the household activity you need to describe.</p>
                    </Card.Text>

                    <NameEntryForm onSubmit={() => this.onNameSubmit()}/>

                    <Button
                        onClick={this.onSeeActivity}
                        disabled={!this.state.activityHidden || !this.state.nameSubmitted}
                        variant="outline-primary"
                    >
                        Enter your activity!
                    </Button>
                </Card.Body>
            </Card>
        )
    }

    onSeeSceneSelection() {
        this.setState({ sceneSelectHidden: false })
        this.props.onSeeSceneSelection()
    }

    onActivityEntrySubmit(activityName) {
        this.setState({ activitySubmitted: true })
        this.props.onActivityNameSubmit(activityName)
    }

    showActivity() {
        return(
            <Card className="marginCard" hidden={this.state.activityHidden}>
                <Card.Body>
                    <Card className="marginCard"><Card.Body>
                        {/* <Card.Title as="h3">Your activity: <b>Pack lunch for four people</b></Card.Title> */}
                        <ActivityEntryForm onSubmit={(activityName) => this.onActivityEntrySubmit(activityName)}/>
                    </Card.Body></Card>
                    <Button
                        onClick={this.onSeeSceneSelection} 
                        disabled={!this.state.sceneSelectHidden || !this.state.activitySubmitted}
                        variant="outline-primary"
                    >
                        Select room and objects 
                    </Button>
                </Card.Body>
            </Card>
        )
        
    }

    render() {
        return (
            <div  id="introduction"> 
                {this.showInstructions()}
                {this.showActivity()}
            </div>
        )
    }
}


export class ConditionWritingInstructions extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            basicConditionsHidden: true,
            composedConditionsHidden: true,
            composedConditionsCategoriesHidden: true,
            conditionDrawersHidden: true
        }

        this.onSeeBasicConditions = this.onSeeBasicConditions.bind(this)
        this.onSeeComposedConditions = this.onSeeComposedConditions.bind(this)
        this.onSeeComposedConditionsCategories = this.onSeeComposedConditionsCategories.bind(this)
        this.onSeeConditionDrawers = this.onSeeConditionDrawers.bind(this)
    }

    onSeeBasicConditions() {
        this.setState({ basicConditionsHidden: false })
    }

    onSeeComposedConditions() {
        this.setState({ composedConditionsHidden: false })
    }

    onSeeComposedConditionsCategories() {
        this.setState({ composedConditionsCategoriesHidden: false })
    }

    onSeeConditionDrawers() { 
        this.setState({ conditionDrawersHidden: false })
        this.props.onSeeConditionDrawers()
    }

    render() {
        return (
            <div>
                <div>
                    <p>Above, you picked a bunch of objects. Some of these objects are <b>instances</b>: they refer to a specific instance of whatever they are. "fruit1" refers to a specific fruit, not fruits in general. On the other hand, just saying "fruit" will refer to the <b>category</b>. If you just use "fruit", you'll be talking about any object as long as it has the category "fruit" or one of the subcategories of "fruit", like "apple". There are specific rules for using instances vs. categories, which I'll explain now.</p>
                    <Button
                        onClick={this.onSeeBasicConditions}
                        variant="outline-primary"
                        disabled={!this.state.basicConditionsHidden}
                        className="marginCard"
                    >
                        Next
                    </Button>
                </div>
                <div hidden={this.state.basicConditionsHidden}>
                    <h5>Basic conditions</h5>
                        <p>Basic conditions are the basic element of any initial or goal condition. They consist of an object (either an instance or a category) and an 
                            <b>adjective</b> applied to it. Examples of adjectives we'll give you are "cooked", "broken", or "dusty".</p>
                        <p style={{ marginLeft: "30px" }}>Example basic condition: <img alt="Basic single-object condition" src={basic_unary_condition_image} width="210"/> </p>
                        <p>Some adjectives need two objects. We have only four such adjectives: "on top of", "under", "next to", and "inside". </p>
                        <p style={{ marginLeft: "30px" }}>Example basic condition: <img alt="Basic two-object condition" src={basic_binary_condition_image} width="275"/></p>
                        <p>Different adjectives might not apply to every object. A "knife" can be "dusty", but it can't exactly be "cooked"! We've taken care of that 
                            for you - when you get to actually building conditions, you'll see that when you pick an object to make a basic condition with, you'll only 
                            be able to pick adjectives that apply to that specific object.</p>
                    <Button
                        onClick={this.onSeeComposedConditions}
                        variant="outline-primary"
                        disabled={!this.state.composedConditionsHidden}
                        className="marginCard"
                    >
                        Next
                    </Button>
                </div>
                <div hidden={this.state.composedConditionsHidden}>
                    <h5>Composed conditions</h5>
                        <p>As you can see, basic conditions are simple sentences. If you were to take anything away, they would no longer be complete sentences. 
                            However, they can definitely be part of larger sentences that express more interesting ideas. Here are ways to make composed conditions. 
                            Note that these forms are somewhat more mathematical-sounding than grammatically correct, but that's okay :)  </p>
                        <h6 className="text-muted" style={{ marginTop: "20px" }}>not condition_block</h6>
                        <p style={{ marginLeft: "30px"}}>Example composed condition: <img alt="Negation condition" src={negation_image} width="250"/></p>
                        <p style={{ marginLeft: "30px" }}>This is pretty simple: it just means that apple1 is not cooked.</p>
                        <p><b>Note that the basic conditions and the "not" block are the only things you need for initial conditions, since they are very concrete. 
                            Everything after this point is used only in goal conditions.</b></p>
                        <h6 className="text-muted"><b>or</b>(first_condition_block, second_condition_block, ..., n-th_condition_block)</h6>
                        <p>The <b>or</b> condition composer means that at least one of the condition blocks plugged into it has to be true. </p>
                        <p style={{ marginLeft: "30px" }}>Example composed condition: <img alt="Disjunction condition" src={disjunction_image} width="310"/></p>
                        <p style={{ marginLeft: "30px" }}>This means that at least one of apple1 and apple2 has to be inside shelf1, but we don't care which one. 
                            We're also okay with both being inside shelf1.</p>
                        <h6 className="text-muted"><b>and</b>(first_condition_block, second_condition_block, ..., n-th_condition_block)</h6>
                        <p>The <b>and</b> condition composer means that all of the condition blocks plugged into it have to be true. </p>
                        <p style={{ marginLeft: "30px" }}>Example composed condition: <img alt="Conjunction condition" src={conjunction_image} width="310"/></p>
                        <p style={{ marginLeft: "30px" }}>This means that both apple1 and apple2 have to be inside shelf1.</p>
                        <h6 className="text-muted"><b>if</b> first_condition_block <b>then</b> second_condition_block</h6>
                        <p>The <b>if/then</b> condition composer means that if the first condition block is true, then the second condition block is true. If the 
                            first one isn't true, then it doesn't matter whether the second one is true or not. </p>
                        <p style={{ marginLeft: "30px" }}>Example composed condition: <img alt="Implication condition" src={implication_image} width="310"/></p>
                        <p style={{ marginLeft: "30px" }}>This means that apple2 only has to be inside shelf1 if apple1 is inside shelf1. If apple1 isn't inside 
                            shelf1, then we don't care whether apple2 is or not. </p> 
                        <p>You can also start to put some of these together. Let's say you don't mind whether the apple1 and apple2 are inside shelf1 or not, but if 
                            they are, you want them to be next to each other. You can't just say "if apple1 is inside shelf1 then apple1 is next to apple2", because 
                            if apple1 is inside shelf1 but apple2 isn't, it'll be very hard for them to be next to each other! You can express that like this:</p> 
                        <p style={{ marginLeft: "30px" }}>Example composed condition: <img alt="Composed implication and conjunction" src={composed_example_image} width="370"/></p> 
                    <Button
                        onClick={this.onSeeComposedConditionsCategories}
                        variant="outline-primary"
                        disabled={!this.state.composedConditionsCategoriesHidden}
                        className="marginCard"
                    >
                        Next
                    </Button>
                </div>
                <div hidden={this.state.composedConditionsCategoriesHidden}>
                    <h5>Composed conditions with categories (only used in goal conditions)</h5>
                        <p>Our final type of condition is composed conditions that use categories. Like the other composers (except the "not" block), these can only be used in the 
                            goal conditions.</p>  
                        <p>All the condition composers until now have used object <em>instances</em>, not object <em>categories</em>. This is because categories are ambiguous, 
                            since there could be any number of them. If I just say "apple is inside shelf1", we don't know which apple I'm referring to, and we also don't know 
                            how many I'm referring to. Is this supposed to apply to every apple? That would be awfully specific. Is it supposed to apply to just one, or two? 
                            Who knows? Here are the composers that will help you be more specific without having to write everything out in terms of object instances. </p>  
                        <p><b>Important note:</b> Basic condition blocks will always have categories available in their dropdown menus, as you'll see in the following 
                            examples. Make sure not to use a category in a basic condition without putting that basic condition into a composer that has a category - this would 
                            make your conditions ambiguous, and we wouldn't be able to use them.</p>
                        <p>After learning about the composers with categories, look at the notes at the end to learn about important uses of these composers.</p>
                        <h6 className="text-muted"><b>for all</b> category, condition_block</h6>    
                        <p>The <b>for all</b> condition composer takes a category and a condition block, and says that for every single instance of that category, the condition 
                            block must be true. </p>    
                        <p style={{ marginLeft: "30px" }}>Example composed condition: <img alt="For all condition" src={universal_image} width="380" /></p>
                        <p style={{ marginLeft: "30px" }}>This means that every single apple should be in shelf1. You're only allowed to use the "apple" category, rather than a 
                            specific apple instance, in the basic sentence because we explicitly said "for all apple". That's why you aren't allowed to use the general shelf category. </p>
                        <h6 className="text-muted"><b>there exists some</b> category <b>such that</b> condition_block</h6>    
                        <p>The <b>there exists some/such that</b> condition composer takes a category and a condition block, and says that there is one instance of the category 
                            for which the basic condition must be true. It's okay if it's true for more than one instance, but only one is required.</p>    
                        <p style={{ marginLeft: "30px" }}>Example composed condition: <img alt="There exists condition" src={existential_image} width="530"/></p>
                        <p style={{ marginLeft: "30px" }}>This means that there has to be some apple inside shelf1, but it doesn't matter which apple - we just know one such apple 
                            exists. This probably reminds you of <b>or</b>, but this is a lot easier than writing out a bunch of super-specific basic conditions to put in your <b>or</b>!</p>
                        <p style={{ marginLeft: "30px" }}>Example composed condition: <img alt="Combined category composers" src={quantified_combo_image} width="640"/></p>
                        <p style={{ marginLeft: "30px" }}>This means that there is some shelf that every apple is inside of. It doesn't matter which shelf, but there is one. Because 
                            you made a composer with category for both apple and shelf, you can use both as categories in your basic condition rather than instances. Note that if you 
                            flipped the order ("<b>for all </b>apple <b>there exists some </b> shelf <b>such that</b> apple is inside shelf"), you would be saying every apple has to 
                            be in a shelf, but it doesn't all have to be the same shelf. Make sure you reflect what you're really thinking!</p>
                        <h6 className="text-muted"><b>for N of</b> category, condition_block</h6>    
                        <p>The <b>for N</b> condition composer takes a counting number N, a category, and a condition block, and does the same thing as <b>for all</b> - except it says 
                            the statement only has to be true for N of the category. It might be true for more than N, but you're not requiring it. </p>    
                        <p style={{ marginLeft: "30px" }}>Example composed condition: <img alt="For N condition" src={forn_image} width="400"/></p>
                        <p style={{ marginLeft: "30px" }}>This means that two apples have to be inside shelf1, but it doesn't matter which apples. </p>
                        <h6 className="text-muted"><b>for pairs of</b> first_category, second_category, condition_block</h6>    
                        <p>The <b>for pairs of</b> condition composer takes two categories and a condition block, and says the condition block has to be true for pairs of objects from 
                            the categories. If one category has fewer instances than the other, that's fine - this only concerns the pairs that can be made, so it'll be concerned with 
                            all the instances from the category with fewer instances, and pair them off with that many of the category with more instances. </p>    
                        <p style={{ marginLeft: "30px" }}>Example composed condition: <img alt="For pairs condition" src={forpairs_image} width="500"/></p>
                        <p style={{ marginLeft: "30px" }}>This means that two apples have to be inside shelf1, but it doesn't matter which apples. </p>
                        <h6 className="text-muted"><b>for N pairs of</b> first_category, second_category, condition_block</h6>    
                        <p>The <b>for N pairs of</b> condition composer takes a counting number N, two categories, and a condition block, and says the basic category has to be true for 
                            N pairs of objects from the categories. Note that this isn't as safe as <b>for pairs</b> - see the note right below.  </p>    
                        <p style={{ marginLeft: "30px" }}>Example composed condition: <img alt="For N pairs condition" src={fornpairs_image} width="520"/></p>
                        <p style={{ marginLeft: "30px" }}>This means that two apples have to be inside shelf1, but it doesn't matter which apples. </p>
                        <h6>Two important notes on composed conditions with categories</h6>
                        <ol>
                            <li>It's often better to use composed conditions with categories than to specify conditions for all the object instances. Let's say you have two apples and 
                                two bowls, and you want to pair them off; you don't really care which apple goes in which bowl as long as they are paired off. It might seem okay to say 
                                "apple1 is inside bowl1 and apple2 is inside bowl2". However, the apples aren't labeled, they're just generic apples; the bowls are similarly generic. So 
                                the robot that does the task has no way of knowing which apple and which bowl are supposed to go together, and could fail the task even if it does what 
                                you're really looking for. In this case, use <b>for pairs of apple and bowl</b>: you will be requiring that the apples and bowls be paired off, but you 
                                won't be requiring that some specific apple go with some specific bowl. </li>
                            <li style={{ marginTop: "10px" }}>Just be careful not to make a condition that's impossible. Let's say you picked four apples above, but then you write a 
                                condition that says "for 5 apple, apple is inside shelf1". That's going to be impossible! The same problem arises with <b>there exists some/such that</b>, 
                                because it requires at least one of its category. With <b>for N pairs</b>, even if one category has N (or more) instances, if the other one has fewer than 
                                N instances, the condition will become impossible. The only ones that are safe are <b>for all</b> and <b>for pairs</b>, because when you have zero apples, 
                                "all" apples is just zero apples.</li>
                        </ol> 
                    <Button
                        onClick={this.onSeeConditionDrawers}
                        variant="outline-primary"
                        disabled={!this.state.conditionDrawersHidden}
                        className="marginCard"
                    >
                        Create conditions! 
                    </Button>
                </div>
            </div>
        )
    }

}

