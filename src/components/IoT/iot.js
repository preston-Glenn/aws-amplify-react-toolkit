import React, {useEffect} from 'react';
import { store, view } from '@risingstack/react-easy-state';
import Widget from '../widgets/widget.js';
import { TextField } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import AWS from 'aws-sdk';
import { Auth, PubSub, API } from 'aws-amplify';
import { AWSIoTProvider } from '@aws-amplify/pubsub/lib/Providers';
import Amplify from 'aws-amplify';
import awsExports from "../../aws-exports";
import './iot.css'
import MenuItem from '@material-ui/core/MenuItem';

const LOCAL_STORAGE_KEY = 'iot-widget';

// TODO change topics to raspberrypi device name

let UNAUTHED = 'UNAUTHORIZED'
let WAITING  = 'WAITING'
let MAKING   = 'MAKING'
let FINISHED = 'FINISHED'

const state = store({
  iotPolicy: 'amplify-toolkit-iot-message-viewer',     // This policy is created by this Amplify project; you don't need to change this unless you want to use a different policy.  
  iotEndpoint: null,              // We retrieve this when the component first loads
  messages: [],
  subscribedTopic: '$aws/things/RaspberryPi/shadow/update/accepted',
  publishTopic: '$aws/things/RaspberryPi/shadow/update',
  subscribedTopics: [],
  subscription: null,
  get_subscription: null,
  iotProviderConfigured: false,
  drinks: ['Spritzer', 'Coke', 'Pepsi', 'Water'],
  device_state: {
    drink: "",
    status: UNAUTHED,
    authorized: false
  },
  desired_drink: ""
});

 
let count = 0;






//------------------------------------------------------------------------------
const EventViewer = (props) => {

  // If needed, attach IoT policy to current user so they can use the pubsub functionality:
  useEffect(() => {
    async function setup() {
      await getIoTEndpoint();
      await configurePubSub();
      subscribeToTopic();
      // subscribeToGET();
      // PubSub.publish('$aws/things/RaspberryPi/shadow/get', {msg:''});
      // await attachIoTPolicyToUser();
    }
    setup();
  }, []);

  return (
    <div className="iot-wrapper">

      <div className="title-wrapper wrapper">
        <h1 className="title">THE MIXER</h1>
        <p className="sub-text">Check the status of the machine and send drink requests</p>
      </div>  

    <div className="box-wrapper">
      <h2>Status</h2>
      <p className="sub-text">{convertParamsToText(state.device_state.status)}</p>
 
      <br/><br/>
      { (state.device_state.authorized && state.device_state.status === WAITING) ?
        <div>


          {/* Make select bigger */}
          <div className="select-wrapper">
            <TextField
              color="primary"
              id="outlined-basic"
              select
              label="Drink         "
              value={state.desired_drink}
              onChange={(e) => {
                state.desired_drink = e.target.value;
              }}
              
              variant="outlined"
              className="select-text-field"
            >
              {state.drinks.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
          </div>
          <br/><br/>
          <Button id="request-drink" variant="contained" color="default" onClick={() => {
                sendDrinkRequest(state.desired_drink);
              }}>
            Select Drink
          </Button>

          
          


        </div>
         : <p></p>
      }

    
      <br /><br />
      
    </div>
    </div>
  );
};





//------------------------------------------------------------------------------
async function getIoTEndpoint() {

  // Each AWS account has a unique IoT endpoint per region. We need to retrieve this value: 
  console.log('Getting IoT Endpoint...'); 
  // TODO Remove
  const credentials = await Auth.currentCredentials();
  const iot = new AWS.Iot({
    region: awsExports.aws_project_region,
    credentials: Auth.essentialCredentials(credentials)
  });
  // const response = await iot.describeEndpoint({endpointType: 'iot:Data-ATS'}).promise();
  // state.iotEndpoint = `wss://${response.endpointAddress}/mqtt`
  state.iotEndpoint = `wss://a1fs6jiodvpd9q-ats.iot.us-east-2.amazonaws.com/mqtt`


  console.log(`Your IoT Endpoint is:\n ${state.iotEndpoint}`);

}


async function configurePubSub() {

  if (!state.iotProviderConfigured) {
    console.log(`Configuring Amplify PubSub, region = ${awsExports.aws_project_region}, endpoint = ${state.iotEndpoint}`);
    Amplify.addPluggable(new AWSIoTProvider({
      aws_pubsub_region: awsExports.aws_project_region,
      aws_pubsub_endpoint: state.iotEndpoint,
    }));
    state.iotProviderConfigured = true;
  }
  else {
    console.log('Amplify IoT provider already configured.');
  }
  
}


//------------------------------------------------------------------------------
function handleReceivedMessage(data) {

  try{
    // Received messages contain the topic name in a Symbol that we have to decode: 
    const symbolKey = Reflect.ownKeys(data.value).find(key => key.toString() === 'Symbol(topic)');
    const publishedTopic = data.value[symbolKey];
    const message = JSON.stringify(data.value, null, 2);

    console.log(`Message received on ${publishedTopic}:\n ${message}`);
    state.device_state.status = data.value.state.reported.status
    state.device_state.authorized = data.value.state.reported.auth
    state.device_state.drink = data.value.state.reported.drink
  } catch(e){
    console.log(e,data)
  }

}

//------------------------------------------------------------------------------
function subscribeToTopic() {
  
  // Fired when user clicks subscribe button:
  // if (state.isSubscribed) {
  //   state.subscription.unsubscribe();
  //   console.log(`Unsubscribed from ${state.subscribedTopic}`);
  //   state.isSubscribed = false;
  //   state.subscribedTopic = '';
  // }
  state.subscription = PubSub.subscribe(state.subscribedTopic).subscribe({
    next: data => handleReceivedMessage(data),
    error: error => console.error(error),
    close: () => console.log('Done'),
  });
  state.isSubscribed = true;
  console.log(`Subscribed to IoT topic ${state.subscribedTopic }`);
  
}

function subscribeToGET() {
  
  state.get_subscription = PubSub.subscribe('$aws/things/RaspberryPi/shadow/get/accepted').subscribe({
    next: data => receivedGetMessage(data),
    error: error => console.error(error),
    close: () => console.log('Done'),
  });
  state.isSubscribed = true;
  console.log(`Subscribed to IoT topic $aws/things/RaspberryPi/shadow/get/accepted`);
  
}

function receivedGetMessage(data){
  if(count === 0){
    try{
      // Received messages contain the topic name in a Symbol that we have to decode: 
      const symbolKey = Reflect.ownKeys(data.value).find(key => key.toString() === 'Symbol(topic)');
      const publishedTopic = data.value[symbolKey];
      const message = JSON.stringify(data.value, null, 2);

      console.log(`Message received on ${publishedTopic}:\n ${message}`);
      state.device_state.status = data.value.state.reported.status
      state.device_state.authorized = data.value.state.reported.auth
      state.device_state.drink = data.value.state.reported.drink
      state.device_state.desired_drink = data.value.state.reported.desired_drink
    } catch(e){
      console.log(e,data)
    }
    count++;
  } else {
    console.log("already received")
  }
}

//------------------------------------------------------------------------------
function sendDrinkRequest(drink) {
  // Fired when user clicks the publish button:
  
  if(state.device_state.authorized && state.device_state.status === WAITING && state.desired_drink !== ""){

    PubSub.publish(state.publishTopic, {
      state: {
        desired: {
          drink: drink,
          auth: state.device_state.authorized,
          status: state.device_state.status
        }
    }
    });
    console.log(`Published message to ${state.publishTopic}.`);
  } else {
    console.log(`User not authenticated yet.`);
  }
}

function convertParamsToText(PARAM){
  switch(PARAM){
    case UNAUTHED : return 'You have not been authenticated, please use the camera to authenticate first.'
    case WAITING  : return 'Please select the drink you would like made.'
    case MAKING   : return 'The Mixer is making your '+state.device_state.drink+' for you'
    case FINISHED : return 'The Mixer finished making your '+state.device_state.drink+'.'
    default: 
      state.device_state.authorized = false
      state.device_state.status = UNAUTHED
    return ""
  }
}


export default view(EventViewer); 