import React from 'react';
import Card from 'react-bootstrap/Card';
import CenteredTree from './object_hierarchy';

import SceneObjectTable from './scene_object_table';
import SelectedObjectsList from './selected_objects_list'
import InitialConditionDrawer from './custom_blocks'


export class Introduction extends React.Component {
    constructor(props) {
        super(props);
    };

    render() {
        return (
            <div  id="introduction"> 
                <Card>
                    <Card.Body>
                        <h4>Introduction</h4>
                        <Card.Text>
                        <p>
                            First, I need you to tell me what the world looks like when I have all the objects I need to {this.props.params.activityName}, but before I have actually done it. This is called <b><em>initial conditions</em></b>,
                        </p>
                        <p>
                            Next, I need you to tell me what the world looks like when I have completed "{this.props.params.activityName}". This is called <b><em>goal conditions</em></b>.
                        </p>
                        <p>
                            This probably seems like a big ask, so I'm going to limit the wrold to just a few objects and descriptors, and I'm going to tell you exactly what a "condition" looks like.
                        </p>
                        <p>
                            <b>Important note:</b> I am <b>not</b> asking you to tell me how to actually <em>execute</em> the task. I want to know what the world looks like before I've done it (initial conditions) and after I've done it (goal conditions), but I don't want you to tell me how to get from the initial conditions to the goal conditions. 
                        </p>
                        </Card.Text>
                    </Card.Body>
                </Card>
            </div>
        )
    }
}

export class ObjectSelectionWorkspace extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            allSelectedObjects: {}
        }

        // this.getSelectedObjects = this.getSelectedObjects.bind(this);
    }

    // getSelectedObjects(selectedObjects) {
    //     this.setState({ allSelectedObjects: selectedObjects })
    // }

    updateSelectedObjects(numObjects, objectCategory) {
        console.log('submitted in SceneObjectSetup')
        let updatedSelectedObjects = {...this.state.allSelectedObjects};
        if (objectCategory in updatedSelectedObjects) {
            updatedSelectedObjects[objectCategory] += numObjects
        } else {
            updatedSelectedObjects[objectCategory] = numObjects
        }
        this.setState({ allSelectedObjects: updatedSelectedObjects })
    }

    render() {
        return (
            <div>
                <Card>
                    <Card.Body>
                        <h4>Setting up the scene</h4>
                        <Card.Text>
                        <p>
                            First, I'll introduce you to the scene you have available for doing this task.
                        </p>
                        <p>
                            [TODO drag-nav interface of a few igibson scenes]
                        </p>
                        </Card.Text>
                    </Card.Body>
                </Card>
                <Card>
                    <Card.Body>
                        <Card.Text>
                        <h4>Objects that make up your scene</h4>
                        <p>
                            First, choose which scene objects are relevant for your initial and goal conditions. Scene objects (listed in the table below) are generally furniture or other background objects you see in a clean home. Don't worry about picking all the furniture and other scene objects you want for the house - as you can see, we've already set up realistic looking scenes. Just tell us which ones you need to do {this.props.params.activityName}. For example, if you need a table to do {this.props.params.activityName} but don't need a sofa, even if you like the idea of having a sofa in the environment for aesthetic reasons, choose the table but not the sofa. 
                        </p>
                        <SceneObjectTable onObjectSubmit={(numObjects, objectCategory) => this.updateSelectedObjects(numObjects, objectCategory)}/>
                        <SelectedObjectsList
                            onObjectDelete={(numObjects, objectCategory) => this.updateSelectedObjects(numObjects, objectCategory)}
                            selectedObjects={this.state.allSelectedObjects}
                        />
                        </Card.Text>
                    </Card.Body>
                </Card>
                <Card>
                    <Card.Body>
                        <h4>Objects you don't see in the scene above</h4>
                        <Card.Text>
                        <p>
                            You also have the following objects available to you. Unlike the scene objects, these aren't automatically present. If you want to use these objects, click a label and add a number.
                        </p>
                        <p>
                            You don't have to use all these objects! Just use the ones you find useful. If there's an object you want but you don't see here, we might have it in our full set of objects. Click "see more objects" to get a hierarchy of all the objects available.
                        </p>
                        <p>
                            <b>Important note:</b> as you can see, these objects follow a hierarchy. You can use any word in your initial and goal conditions. For example, {this.props.params.example_super_cat} is a supercategory of {this.props.params.example_sub_cat1} and {this.props.params.example_sub_cat2}. You can use {this.props.params.example_super_cat}, {this.props.params.example_sub_cat1}, or {this.props.params.example_sub_cat2} in your description. The important thing to remember is that if you say something applies to {this.props.params.example_super_cat}, e.g. "{this.props.params.example_super_cat} is {this.props.params.example_descriptor}", that will apply to <em>every object</em> that is {this.props.params.example_super_cat}, including any object that is {this.props.params.example_sub_cat1} or {this.props.params.example_sub_cat2}.
                        </p>
                        [TODO: click to add objects, ideally into the list already started for scene objects]
                        </Card.Text>
                        <CenteredTree/>
                    </Card.Body>
                </Card>
            </div>
        )
    }
}

export class InitialConditionInstruction extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Card>
                <Card.Body>
                    <h4>Writing initial conditions</h4>
                    <Card.Text>
                    <p>
                        Now, let's discuss how to write conditions. 
                    </p>
                    <p>
                        Above, you picked a bunch of objects. Some of these objects are <b>instances</b>: they refer to a specific instance of whatever they are. "fruit1" refers to a specific fruit, not fruits in general. On the other hand, just saying "fruit" will refer to the <b>category</b>. If you just use "fruit", you'll be talking about any object as long as it has the category "fruit" or one of the subcategories of "fruit", like "apple". There are specific rules for using instances vs. categories, which I'll explain now.
                    </p>
                    {/* <h5>Basic conditions</h5> */}
                    <h5>Basic conditions</h5>
                    <p>
                        Basic conditions are the basic element of any initial or goal condition. It is made by taking any object, whether an instance or a category, and applying an <b>adjective</b> to it. Examples of adjectives we'll give you are "cooked", "broken", or "dusty".
                    </p>
                    <p style={{ marginLeft: "30px" }}>
                        Example basic condition: "apple1 is cooked" [TODO JUST GIVE THE BLOCK IMAGE HERE]
                    </p>
                    <p>
                        Some adjectives need two objects. We have only four such adjectives: "on top of", "under", "next to", and "inside". 
                    </p>
                    <p style={{ marginLeft: "30px" }}>
                        Example basic condition: "apple1 is inside shelf1" [TODO JUST GIVE THE BLOCK IMAGE HERE]
                    </p>
                    <p>Different adjectives might not apply to every object. A "knife" can be "dusty", but it can't exactly be "cooked"! We've taken care of that for you - when you get to actually building conditions, you'll see that when you pick an object to make a basic condition with, you'll only be able to pick adjectives that apply to that specific object.</p>
                    <h5>Composed conditions</h5>
                    <p>
                        As you can see, basic conditions are simple sentences. If you were to take anything away, they would no longer be complete sentences. However, they can definitely be part of larger sentences, like compound or complex sentences, that are still grammatically correct and express more interesting ideas. Here are ways to make composed conditions.  
                    </p>
                    <h6 className="text-muted">basic_condition1 <b>or</b> basic_condition2</h6>
                    <p>
                        The <b>or</b> condition composer means that only one of the two basic conditions has to be true. 
                    </p>
                    <p style={{ marginLeft: "30px" }}>
                        Example composed condition: "apple1 is inside shelf1 <b>or</b> apple2 is inside shelf1" [TODO BLOCK IMAGE]
                    </p>
                    <p style={{ marginLeft: "30px" }}>
                        This means that at least one of apple1 and apple2 has to be inside shelf1, but we don't care which one. We're also okay with both being inside shelf1.
                    </p>
                    <h6 className="text-muted">basic_condition1 <b>and</b> basic_condition2</h6>
                    <p>
                        The <b>and</b> condition composer means that both of the two basic conditions have to be true. 
                    </p>
                    <p style={{ marginLeft: "30px" }}>
                        Example composed condition: "apple1 is inside shelf1 <b>and</b> apple2 is inside shelf1" [TODO BLOCK IMAGE]
                    </p>
                    <p style={{ marginLeft: "30px" }}>
                        This means that both apple1 and apple2 have to be inside shelf1.
                    </p>
                    <h6 className="text-muted"><b>if</b> basic_condition1 <b>then</b> basic_condition2</h6>
                    <p>
                        The <b>if/then</b> condition composer means that if the first basic condition is true, then the second basic condition is true. If the first one isn't true, then it doesn't matter whether the second one is true or not. 
                    </p>
                    <p style={{ marginLeft: "30px" }}>
                        Example composed condition: "<b>if</b> apple1 is inside shelf1 <b>then</b> apple2 is inside shelf1" [TODO BLOCK IMAGE]
                    </p>
                    <p style={{ marginLeft: "30px" }}>
                        This means that apple2 only has to be inside shelf1 if apple1 is inside shelf1. If apple1 isn't inside shelf1, then we don't care whether apple2 is or not. 
                    </p> 
                    <p>You can also start to put some of these together. Let's say you don't mind whether the apple1 and apple2 are inside shelf1 or not, but if they are, you want them to be next to each other. You can't just say "if apple1 is inside shelf1 then apple1 is next to apple2", because if apple1 is inside shelf1 but apple2 isn't, it'll be very hard for them to be next to each other! You can express that like this:</p> 
                    <p style={{ marginLeft: "30px" }}>
                        Example composed condition: "<b>if</b> apple1 is inside shelf1 <b>and</b> apple2 is inside shelf1, <b>then</b> apple1 is next to apple2."  [TODO BLOCK IMAGE]
                    </p> 
                    <h6 className="text-muted">not basic_condition1</h6>    
                    <p>
                        The <b>not</b> condition composer just takes one basic condition, and says it's not true.
                    </p>    
                    <p style={{ marginLeft: "30px" }}>
                        Example composed condition: "<b>not</b> apple1 is sliced"  [TODO BLOCK IMAGE]
                    </p>
                    <p style={{ marginLeft: "30px" }}>
                        This is pretty simple: it just means that apple1 is not sliced. I know this is a little grammatically incorrect - that's okay though :) 
                    </p>
                    <h6>Composed conditions with categories</h6>  
                    <p>
                        All the condition composers until now have used object <em>instances</em>, not object <em>categories</em>. This is because categories are ambiguous, since there could be any number of them. If I just say "apple is inside shelf1", we don't know which apple I'm referring to, and we also don't know how many I'm referring to. Is this supposed to apply to every apple? That would be awfully specific. Is it supposed to apply to just one, or two? Who knows? Here are the composers that will help you be more specific without having to write everything out in terms of object instances. 
                    </p>  
                    <h6 className="text-muted"><b>for all</b> category, basic_condition</h6>    
                    <p>
                        The <b>for all</b> condition composer takes a category and a basic condition, and says that for every single instance of that category, the basic condition must be true. 
                    </p>    
                    <p style={{ marginLeft: "30px" }}>
                        Example composed condition: "<b>for all</b> apple, apple is inside shelf1"  [TODO BLOCK IMAGE]
                    </p>
                    <p style={{ marginLeft: "30px" }}>
                        This means that every single apple should be in shelf1. You're only allowed to use the "apple" category, rather than a specific apple instance, in the basic sentence because we explicitly said "for all apple". That's why you aren't allowed to use the general shelf category. 
                    </p>
                    <h6 className="text-muted"><b>there exists some</b> category <b>such that</b> basic_condition</h6>    
                    <p>
                        The <b>there exists some/such that</b> condition composer takes a category and a basic condition, and says that there is one instance of the category for which the basic condition must be true. 
                    </p>    
                    <p style={{ marginLeft: "30px" }}>
                        Example composed condition: "<b>There exists some</b> apple <b>such that</b> apple is inside shelf1"  [TODO BLOCK IMAGE]
                    </p>
                    <p style={{ marginLeft: "30px" }}>
                        This means that there has to be some apple inside shelf1, but it doesn't matter which apple - we just know one such apple exists. This probably reminds you of <b>or</b>, but this is a lot easier than writing out a bunch of super-specific basic conditions to put in your <b>or</b>!
                    </p>
                    <p style={{ marginLeft: "30px" }}>
                        Example composed condition: "<b>there exists some </b> shelf <b>such that</b> <b>for all </b> apple, apple is inside shelf"  [TODO BLOCK IMAGE]
                    </p>
                    <p style={{ marginLeft: "30px" }}>
                        This means that there is some shelf that every apple is inside of. It doesn't matter which shelf, but there is one. Because you made a composer with category for both apple and shelf, you can use both as categories in your basic condition rather than instances. Note that if you flipped the order ("<b>for all </b>apple <b>there exists some </b> fridge <b>such that</b> apple is inside fridge"), you would be saying every apple has to be in a fridge, but it doesn't all have to be the same fridge. Make sure you reflect what you're really thinking!
                    </p>
                    <h6 className="text-muted"><b>for N of</b> category, basic_condition</h6>    
                    <p>
                        The <b>for N</b> condition composer takes a counting number N, a category, and a basic condition, and does the same thing as <b>for all</b> - except it says the statement only has to be true for N of the category. It might be true for more than N, but you're not requiring it. 
                    </p>    
                    <p style={{ marginLeft: "30px" }}>
                        Example composed condition: "<b>for 2</b> apple, apple is inside shelf1"  [TODO BLOCK IMAGE]
                    </p>
                    <p style={{ marginLeft: "30px" }}>
                        This means that two apples have to be inside shelf1, but it doesn't matter which apples. 
                    </p>
                    <h6 className="text-muted"><b>for all pairs of</b> category1, category2, basic_condition</h6>    
                    <p>
                        The <b>for all pairs of</b> condition composer takes two categories and a basic condition, and says the basic category has to be true for all pairs of objects from the categories. If one category has fewer instances than the other, that's fine - this only concerns the pairs that can be made, so it'll be concered with all the instances from the category with fewer instances, and only that lesser number of instances from the category with more. 
                    </p>    
                    <p style={{ marginLeft: "30px" }}>
                        Example composed condition: "<b>for all pairs of</b> apple, bowl: apple is inside bowl"  [TODO BLOCK IMAGE]
                    </p>
                    <p style={{ marginLeft: "30px" }}>
                        This means that two apples have to be inside shelf1, but it doesn't matter which apples. 
                    </p>
                    <h6 className="text-muted"><b>for N pairs of</b> category1, category2, basic_condition</h6>    
                    <p>
                        The <b>for N pairs of</b> condition composer takes a counting number N, two categories, and a basic condition, and says the basic category has to be true for N pairs of objects from the categories. Note that this isn't as safe as <b>for all pairs</b> - see the note right below.  
                    </p>    
                    <p style={{ marginLeft: "30px" }}>
                        Example composed condition: "<b>for N pairs of</b> apple, bowl: apple is inside bowl"  [TODO BLOCK IMAGE]
                    </p>
                    <p style={{ marginLeft: "30px" }}>
                        This means that two apples have to be inside shelf1, but it doesn't matter which apples. 
                    </p>
                    <h6>Note on composed conditions with categories</h6>
                    <p>
                        Composed conditions with categories are helpful and powerful. It's always better to use them when you could go either way - for example, with <b>for all pairs</b>, it might be tempting to just make a bunch of conditions like "apple1 is in bowl1, apple2 is in bowl2, apple3 is in bowl3". But <b>for all pairs</b> is actually better because it doesn't say that some specific apple has to be in some specific bowl - it just says, each apple has to be in a bowl and each bowl has to have an apple, which is probably what you really mean. Otherwise, the robot that actually does this task might put two identical-looking apples in two identical-looking bowls but have switched the order enforced by specifying "apple1", "apple2", "bowl1", and "bowl2". If we could look at them we'd think it had done the right thing, but unfortunately the program will tell it it's failed.
                    </p>
                    <p>
                        Just be careful not to make a condition that's impossible. Let's say you picked four apples above, but then you write a condition that says "for 5 apple, apple is inside shelf1". That's going to be impossible! The same problem arises with <b>there exists some/such that</b>, because requires at least one of its category. With <b>for N pairs</b>, even if one category has N (or more) instances, if the other one has fewer than N instances, the condition will become impossible. The only ones that are safe are <b>for all</b> and <b>for all pairs</b>, because "all" apples when you have zero apples can just be zero apples.
                    </p>

                    </Card.Text>
                </Card.Body>
            </Card>
        )
    }
}


export class InitialConditionWorkspace extends React.Component {
    render() {
        return(
            <InitialConditionDrawer/>
        )
    }
}


