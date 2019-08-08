// Copyright (C) 2019 Alina Inc. All rights reserved.

import firebase from 'firebase/app';
import { isEmpty } from 'lodash';
import generateHash from 'random-hash';
import React, { useRef } from 'react';
import { toast } from 'react-toastify';
import { Input, Spinner } from 'reactstrap';

import 'react-toastify/dist/ReactToastify.css';
import { FirebaseDatabaseMutation, FirebaseDatabaseNode } from '@react-firebase/database';

import messages, { entry } from '../../../messages';
import shapes from '../../../shapes';

const Entry = ({ history, match: { params } }) => {
  const inputRef = useRef(null);
  const isHost = isEmpty(params);
  const path = isEmpty(params) ? '/rooms/' : `/rooms/${params.roomId}/players`;
 
  const makeOrEnterRoom = (runMutation) => async () => {
    let exists = false;
    if (inputRef.current.value.length > 6) {
      toast.warning(messages.entry.overmax);
      return null;
    }
    if (!inputRef.current.value) {
      toast.error(messages.entry.noinput);
      return null;
    }
    if (!isHost) {
      const users = await firebase.database()
        .ref(`/rooms/${params.roomId}/players/`)
        .once('value');
      Object.values(users.val())
        .forEach(element => {
        if (element.name === inputRef.current.value) {
          exists = true;
        }
      });
      if (exists) {
        toast.error('이미 존재하는 이름입니다');
        return null;
      }
    }
    if (isHost) {
      const res = await runMutation({
        players: { host: { connect: generateHash(), name: inputRef.current.value, start: 0 } },
      });
      history.push(`/platform/waiting_room/${res.key}/host`);
    } else {
      const hostVal = await firebase.database()
        .ref(`/rooms/${params.roomId}/players/host/connect`)
        .once('value');
      const res = await runMutation({ connect: hostVal.val(), name: inputRef.current.value });
      history.push(`/platform/waiting_room/${params.roomId}/user/${res.key}`);
    }
    return null;
  };

  const enter = () => (
    <FirebaseDatabaseMutation path={path} type="push">
      {({ runMutation }) => (
        <>
          <Input
            innerRef={inputRef}
            placeholder={entry.nickName}
            id="input"
            onKeyPress={e => (e.key === 'Enter') && makeOrEnterRoom(runMutation)()}
          />
          <button
            type="button"
            id="button"
            onClick={makeOrEnterRoom(runMutation)}
          >
            {entry.enter}
          </button>
        </>
      )}
    </FirebaseDatabaseMutation>
  );
  const checkRoomExists = () => (
    <FirebaseDatabaseNode path="/rooms/">
      {({ value }) => {
        if (!value) {
          return <Spinner color="primary" />;
        }
        if (!isEmpty(params) && !value[params.roomId]) {
          return <div>{entry.room.not}</div>;
        }
        return (
          <div className="entry">
            <div>
              <h2 id="header">{entry.ask.name}</h2>
            </div>
            <div>
              {enter()}
            </div>
          </div>
        );
      }}
    </FirebaseDatabaseNode>
  );

  return (
    <div>
      {checkRoomExists()}
    </div>
  );
};

Entry.propTypes = {
  history: shapes.history.isRequired,
  match: shapes.match.isRequired,
};

export default Entry;
