// Copyright (C) 2019 Alina Inc. All rights reserved.

import firebase from 'firebase/app';
import React, { useEffect } from 'react';
import { useIntl } from 'react-intl';
import { Redirect } from 'react-router-dom';

import { FirebaseDatabaseNode } from '@react-firebase/database';

import { messages, t } from '../../../i18n';
import shuffle from '../../../lib/shuffle';
import shapes from '../../../shapes';

const SelectLine = ({ history, match: { params: { roomId, userId } } }) => {
  const intl = useIntl();
  const lines = [
    'line1', 'line2', 'line3', 'line4', 'line5',
    'line6', 'line7', 'line8', 'line9', 'gyeongui',
  ];
  useEffect(() => {
    if (userId === 'host') {
      firebase.database()
        .ref(`rooms/${roomId}/players/host/`)
        .update({ gameData: null, keys: null, replay: 0, start: 1, turn: null });
    }
  }, [roomId, userId]);

  useEffect(() => {
    (async () => {
      if (userId === 'host') {
        const players = await firebase.database()
          .ref(`rooms/${roomId}/players/`)
          .once('value');
        const temp = await shuffle(Object.keys(players.val()));
        await firebase.database()
          .ref(`rooms/${roomId}/players/host`)
          .update({ keys: temp });
      }
      return null;
    })();
  }, [roomId, userId]);

  const onClickButton = (e) => {
    firebase.database()
      .ref(`rooms/${roomId}/players/host`)
      .update({ line: e.target.value, start: 2 });
    history.push(`/games/subway/play/${e.target.value}/${roomId}/user/${userId}`);
  };
  const toWaiting = () => (
    <button
      className="button-quit"
      type="button"
      onClick={async () => {
        await firebase.database().ref(`/rooms/${roomId}/players/host`)
          .update({ gameData: null, roulette: null, start: 0 });
        history.push(`/platform/waiting_room/${roomId}/host`);
      }}
    >
      {t(intl, messages.button.back)}
    </button>
  );
  const renderHostPage = () => (
    <div id="main-title">
      {toWaiting()}
      <h2>{t(intl, messages.subwayGame.selectLine.title)}</h2>
      <div id="line-buttons">
        {lines.map(line => (
          <button id={line} type="button" key={line} value={line} onClick={onClickButton}>
            {t(intl, messages.subwayGame.selectLine.line[line])}
          </button>
        ))}
      </div>
    </div>
  );
  const renderPlayerPage = () => (
    <div>
      <FirebaseDatabaseNode path={`rooms/${roomId}/players/host`}>
        {({ value }) => {
          if (!value) {
            return <div className="loader" />;
          }
          if (value.start === 0) {
            return (
              <Redirect to={`/platform/waiting_room/${roomId}/user/${userId}`} />
            );
          }
          if (value.start === 2) {
            return (
              <Redirect to={`/games/subway/play/${value.line}/${roomId}/user/${userId}`} />
            );
          }
          return (
            <div>
              <div className="loader" />
              <h3 id="waiting">{t(intl, messages.subwayGame.choosing)}</h3>
            </div>
          );
        }}
      </FirebaseDatabaseNode>
    </div>
  );
  if (userId === 'host') {
    return renderHostPage();
  }
  return renderPlayerPage();
};

SelectLine.propTypes = {
  history: shapes.history.isRequired,
  match: shapes.match.isRequired,
};

export default SelectLine;
