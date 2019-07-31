// Copyright (C) 2019 Alina Inc. All rights reserved.

import React from 'react';
import { Route, Switch } from 'react-router';

import Entry from './Entry';
import Ranking from './Ranking';
import Ready from './Ready';
import WaitingRoom from './WaitingRoom';

/* eslint-disable */
const Platform = ({ match }) => (
  <Switch>
    <Route exact path={`${match.url}/entry`} component={Entry} />
    <Route exact path={`${match.url}/ranking`} component={Ranking} />
    <Route exact path={`${match.url}/ready`} component={Ready} />
    <Route path={`${match.url}/waiting_room/:roomId`} component={WaitingRoom} />
  </Switch>
);

export default Platform;
