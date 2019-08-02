// Copyright (C) 2019 Alina Inc. All rights reserved.

import React, { useEffect, useState, Fragment } from 'react';
import { Redirect } from 'react-router-dom';
import { Button } from 'reactstrap';

import { FirebaseDatabaseMutation } from '@react-firebase/database';

import clickGame from '../../messages/clickGame';
import shapes from '../../shapes';

const Play = ({ match: { params: { roomId, userId } } }) => {
  const [clickCount, setClickCount] = useState(0);
  const defalutSecond = 10;
  const [seconds, setSeconds] = useState(defalutSecond);
  const [buttonState, setButtonState] = React.useState(false);
  useEffect(() => {
    const id = setInterval(() => {
      setSeconds(s => s - 1);
    }, 1000);

    const sec = defalutSecond * 1000;
    setTimeout(() => {
      setButtonState(true);
      clearInterval(id);
    }, sec);
  }, [defalutSecond]);

  if (buttonState) {
    return (
      <Fragment>
        <FirebaseDatabaseMutation path={`/rooms/${roomId}/players/host/`} type="update">
          {({ runMutation }) => {
            runMutation({ replay: 0 });
            return null;
          }}
        </FirebaseDatabaseMutation>
        <FirebaseDatabaseMutation path={`/rooms/${roomId}/players/${userId}`} type="update">
          {({ runMutation }) => {
            runMutation({ end: 1, gameData: clickCount || 0 });
            if (userId === 'host') {
              return <Redirect to={`/platform/ranking/${roomId}/user/host`} />;
            }
            return <Redirect to={`/platform/ranking/${roomId}/user/${userId}`} />;
          }}
        </FirebaseDatabaseMutation>
      </Fragment>
    );
  }

  const onClickButton = () => {
    const click = clickCount + 1;
    setClickCount(click);
  };

  return (
    <div>
      <h2>{clickGame.title}</h2>
      <p>{`${clickGame.time}: ${seconds}`}</p>
      <p>{`${clickGame.score}: ${clickCount}`}</p>
      <Button type="button" onClick={onClickButton} disabled={buttonState}>
        {clickGame.button}
      </Button>
    </div>
  );
};

Play.propTypes = {
  match: shapes.match.isRequired,
};

export default Play;
