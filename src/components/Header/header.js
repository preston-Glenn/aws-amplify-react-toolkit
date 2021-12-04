import React from 'react';
import { view } from '@risingstack/react-easy-state';
import 'cross-fetch/polyfill';
import AppBar from '@material-ui/core/AppBar';
import useStyles from '../common/material-ui-styles.js';
import { AmplifySignOut } from '@aws-amplify/ui-react';
import './header.css'

const Header = view(() => {
  

  return (

    <div  className="header-wrapper">
      
      <AmplifySignOut className="right-header-item" />
    </div>
  );

});

export default Header; 