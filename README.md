## BEHAVIOR Activity Annotation Interface 

This project implements the frontend for the BEHAVIOR activity annotation interface. This interface allows you to define your own activities in a visual version of the BEHAVIOR Domain Definition Language (BDDL). You can try out [a version of this interface](https://stanfordvl.github.io/behavior-activity-annotation/) on our website!

The version linked above does *not* test your definition for feasibility: meaning, it doesn't check if the definition you've created fits in iGibson scenes. This repo allows you to not only define, but check **feasibility** of definitions, i.e. to ensure that they will fit into your simulated scenes. 

This repository provides the full frontend functionality, which covers everything needed to create a definition. To *check feasibility* and *save the definition*, you will need to add the following: 
1. Backend running a simulator that can sample a BDDL definition. This can be implemented in iGibson or any other compatible simulator. 
2. Storage database to save in-progress and completed BDDL definitions, e.g. AirTable. 

### Implementing backend and storage 

**Backend:** The frontend interacts with the backend by first sending scenes to initialize on different instances of the simulator, then sending BDDL definitions created on the frontend to attempt sampling in the simulator, then finally tearing down the simulators once a final definition has been submitted. To interface with the frontend at each of these, see the following instructions. They mention various URLs for interfacing with the backend, which should be defined in [`src/constants.js`](https://github.com/sanjanasrivastava/WorldStateExperiment/blob/master/src/constants.js).

1. **Initialize different instances of the simulator:** This can be done by POSTing to some `SetupUrl` with information regarding the scenes to be tested. We show an example [here](https://github.com/sanjanasrivastava/WorldStateExperiment/blob/bc5d4789afea0d37f2bc8f2f23ef91d627a08fd1/src/activity_entry_form.js#L38). You can see the mapping of official BEHAVIOR activities to iGibson scenes in [`activity_to_preselected_scenes.json`](https://github.com/sanjanasrivastava/WorldStateExperiment/blob/master/src/data/activity_to_preselected_scenes.json). Custom activities (not in the [BEHAVIOR 100 activities list](https://behavior.stanford.edu/activity_list.html)) will have the same scenes as `assembling_gift_baskets` by default. You are free to add selections for particular activities. If you are not using iGibson scenes, you can make new entries in this file that provide the information your simulator needs. 
2. **Send BDDL definitions to attempt sampling:** This can be done by POSTing definition data to some `SamplingUrl`. We show an example [here](https://github.com/sanjanasrivastava/WorldStateExperiment/blob/a411c0607bfa7dec9351a8a53b09dbe35b8af18e/src/blockly_drawers.js#L212). The frontend checks for code correctness then sends the BDDL sections to the backend through the POST to be checked for feasibility.
3. **Tear down simulators after submitting:** This can be done once a submission is made by POSTing a teardown request to some `TeardownUrl` (making the submission final). We show an example [here](https://github.com/sanjanasrivastava/WorldStateExperiment/blob/a411c0607bfa7dec9351a8a53b09dbe35b8af18e/src/blockly_drawers.js#L393). 

It is up to you how you would like to run multiple simulator instances and sample on the backend. The [iGibson 2.0 codebase](https://github.com/StanfordVL/iGibson) will be helpful here. 

**Storage:** Our internal annotation process allows both unfinished and finished BDDL definitions to be saved. The frontend has `Save` buttons to save current work to a database, as well as a `Submit` button that makes a submission after checking correctness and feasibility. If you would like to use either or both of these, the data can be POSTed to a database of your choosing. Save requests to storage should be implemented [here](https://github.com/sanjanasrivastava/WorldStateExperiment/blob/a411c0607bfa7dec9351a8a53b09dbe35b8af18e/src/blockly_drawers.js#L496) and submit requests to storage [here](https://github.com/sanjanasrivastava/WorldStateExperiment/blob/a411c0607bfa7dec9351a8a53b09dbe35b8af18e/src/blockly_drawers.js#L380). 

It is up to you how you would like to store your data. The comments offer suggested fields that can be used to construct a full BDDL definition. 


## Running this frontend (create-react-app basics, source: Facebook)

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app). For details on how to run it, see below: 

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: https://facebook.github.io/create-react-app/docs/code-splitting

### Analyzing the Bundle Size

This section has moved here: https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size

### Making a Progressive Web App

This section has moved here: https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app

### Advanced Configuration

This section has moved here: https://facebook.github.io/create-react-app/docs/advanced-configuration

### Deployment

This section has moved here: https://facebook.github.io/create-react-app/docs/deployment

### `npm run build` fails to minify

This section has moved here: https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify
