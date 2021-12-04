import './App.css';
import { withAuthenticator } from '@aws-amplify/ui-react';
import CssBaseline from '@material-ui/core/CssBaseline';
import useStyles from './components/common/material-ui-styles.js';
import Header from './components/Header/header';
import Body from './components/Body/body';
import Iot from './components/IoT/iot'


function App() {

  const classes = useStyles();

  return (
    <div className="app-wrapper">
      <Header />
      <Iot/>
      <Body />
    </div>
  );
}

export default withAuthenticator(App);