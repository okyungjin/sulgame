/* eslint-disable */

import firebase from 'firebase/app';
import PropTypes from 'prop-types';
import React from 'react';

import { rouletteGame } from '../../../messages';

class Roulette extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      spinAngleStart: 0,
      startAngle: 0,
      spinTime: 0,
      arc: Math.PI / (props.options.length / 2),
    };
    this.spinTimer = null;
    this.handleOnClick = this.handleOnClick.bind(this);
    this.spin = this.spin.bind(this);
    this.rotate = this.rotate.bind(this);
  }

  static propTypes = {
    baseSize: PropTypes.number,
    className: PropTypes.string,
    onComplete: PropTypes.func,
    options: PropTypes.array,
    spinAngleStart: PropTypes.number,
    spinTimeTotal: PropTypes.number,
  };

  static defaultProps = {
    baseSize: 500,
    options: ['item1', 'item2', 'item3', 'item4', 'item5'],
    spinAngleStart: Math.random() * 10 + 10,
    spinTimeTotal: Math.random() * 3 + 5 * 1000,
  };

  componentDidMount() {
    this.drawRouletteWheel();
  }

  byte2Hex(n) {
    const nybHexString = '0123456789ABCDEF';
    return String(nybHexString.substr((n >> 4) & 0x0F,1)) + nybHexString.substr(n & 0x0F,1);
  }
  
  RGB2Color(r,g,b) {
    return '#' + this.byte2Hex(r) + this.byte2Hex(g) + this.byte2Hex(b);
  }

  getColor(item, maxitem) {
    const phase = 0;
    const center = 128;
    const width = 128;
    const frequency = Math.PI*2/maxitem;
    
    const red   = Math.sin(frequency*item+2+phase) * width + center;
    const green = Math.sin(frequency*item+0+phase) * width + center;
    const blue  = Math.sin(frequency*item+4+phase) * width + center;
    
    return this.RGB2Color(red,green,blue);
  }
  
  drawRouletteWheel() {
    const { baseSize, options } = this.props;
    let { arc, startAngle } = this.state;
    let ctx;
    
    const canvas = this.refs.canvas;
    if (canvas.getContext) {
      const outsideRadius = baseSize;
      // 룰렛 안 글자 위치
      const textRadius = baseSize / 2;
      const insideRadius = 0;
      
      ctx = canvas.getContext('2d');
      ctx.clearRect(0,0,600,600);
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.font = '30px Helvetica, Arial';
      
      for (let i = 0; i < options.length; i++) {
        const angle = startAngle + i * arc;
        
        ctx.fillStyle = this.getColor(i, options.length);
         
        ctx.beginPath();
        // ctc.arc(x좌표, y좌표, 반지름, 시작각도, 끝각도, 그리는 방향)
        // 그리는 방향 false: 시계 방향, true: 반시계 방향
        ctx.arc(baseSize, baseSize, outsideRadius, angle, angle + arc, false);
        ctx.arc(baseSize, baseSize, insideRadius, angle + arc, angle, true);
        ctx.fill();
        
        // 룰렛 안 글자
        ctx.save();
        ctx.fillStyle = 'white';
        // ctx.translate(x, y): (x, y)를 (0, 0)으로 정해주는 함수
        ctx.translate(baseSize + Math.cos(angle + arc / 2) * textRadius,
        baseSize + Math.sin(angle + arc / 2) * textRadius);
        ctx.rotate(angle + arc / 2 + Math.PI / 2);
        const text = options[i];
        ctx.fillText(text, -ctx.measureText(text).width / 2, 0);
        ctx.restore();
      }
      
      // 화살표
      ctx.fillStyle = 'red';
      ctx.beginPath();
      ctx.lineTo(baseSize + 10, baseSize - (outsideRadius + 20));
      ctx.lineTo(baseSize + 0, baseSize - (outsideRadius - 20));
      ctx.lineTo(baseSize - 10, baseSize - (outsideRadius + 20));
      ctx.fill();
      ctx.stroke();
    }
  }
  
  spin() {
    this.spinTimer = null;
    this.setState({ spinTime: 0}, () => this.rotate());
  }
  
  rotate(){
    const { spinAngleStart, spinTimeTotal } = this.props;
    if(this.state.spinTime > 2800) {
      clearTimeout(this.spinTimer);
      this.stopRotateWheel();
    } else {
      const spinAngle = spinAngleStart - this.easeOut(this.state.spinTime, 0, spinAngleStart, spinTimeTotal);
      this.setState({
        startAngle: this.state.startAngle + spinAngle * Math.PI / 180,
        spinTime: this.state.spinTime + Math.random() * 10 + 30,
      }, () => {
        this.drawRouletteWheel();
        clearTimeout(this.spinTimer);
        this.spinTimer = setTimeout(() => this.rotate(), Math.random() * 10 + 30);
      })
    }
  }
  
  stopRotateWheel() {
    let { startAngle, arc } = this.state;
    const { options, baseSize } = this.props;
    
    const canvas = this.refs.canvas;
    const ctx = canvas.getContext('2d');
    
    const degrees = startAngle * 180 / Math.PI + 90;
    const arcd = arc * 180 / Math.PI;
    const index = Math.floor((360 - degrees % 360) / arcd);
    ctx.save();
    // ctx.font = 'bold 40px Helvetica, Arial';
    const text = options[index]

    // // 당첨된 항목 글자 위치 조정
    // ctx.fillText(text, baseSize - ctx.measureText(text).width / 2, baseSize * 1.8);
    // ctx.restore();
    this.props.onComplete(text);
  }
  
  easeOut(t, b, c, d) {
    const ts = (t/=d)*t;
    const tc = ts*t;
    return b+c*(tc + -3*ts + 3*t);
  }
  
  handleOnClick(e) {
    e.preventDefault();
    this.spin();
    firebase.database().ref(`/rooms/${this.props.roomId}/players/host`).update({ gameData: 0 });
  }

  render() {
    const { baseSize } = this.props;
    return (
      <div className="game roulette-container">
        <h1 className="game-header">{rouletteGame.title}</h1>
        <p className="discription">{rouletteGame.description}</p>
        <canvas
          className="roulette-canvas"
          height={baseSize * 2}
          ref="canvas"
          width={baseSize * 2}
        />
        <button onClick={this.handleOnClick}>{rouletteGame.spin}</button>
      </div>
    );
  }
}

export default Roulette;
