// Copyright (C) 2019 Alina Inc. All rights reserved.

import React from 'react';
import { Button, Container, Table } from 'reactstrap';

import { button, ranking } from '../../messages';

const Ranking = () => {
  const rowsTest = [ // FIXME dummy data should be exchaged by real data
    { rank: 1, score: 100, title: 'Hong' },
    { rank: 2, score: 90, title: 'Pikachu' },
  ];

  const renderData = () => (
    rowsTest.map((user) => {
      const { rank, score, title } = user;
      return (
        <tr key={rank}>
          <th scope="row">
            {rank}
            {ranking.rank.postfix}
          </th>
          <td>{title}</td>
          <td>{score}</td>
        </tr>
      );
    })
  );

  return (
    <Container>
      <h1>{ranking.title}</h1>
      <Button>{button.quit}</Button>
      <Table hover>
        <thead>
          <tr>
            <th>{ranking.rank.title}</th>
            <th>{ranking.name}</th>
            <th>{ranking.score}</th>
          </tr>
        </thead>
        <tbody>
          {renderData()}
        </tbody>
      </Table>
      <Button>{button.retry.othergame}</Button>
      <Button>{button.retry.thisgame}</Button>
    </Container>
  );
};

export default Ranking;
