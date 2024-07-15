import React, { useState } from 'react';
import './Sqaure.css';
const circleSvg = (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
    <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
    <g id="SVGRepo_iconCarrier">
      <path
        d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
        stroke="#ffffff"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      ></path>
    </g>
  </svg>
);

const crossSvg = (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
    <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
    <g id="SVGRepo_iconCarrier">
      <path
        d="M19 5L5 19M5.00001 5L19 19"
        stroke="#fff"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      ></path>
    </g>
  </svg>
);

const Square = ({ id, finishedArrayState, currentPlayer, setcurrentPlayer, setgamestate, finishState, setfinishState }) => {
  const [icon, seticon] = useState(null);

  const handleClick = () => {
    if (!icon && !finishState) {
      seticon(currentPlayer === 'circle' ? circleSvg : crossSvg);
      setgamestate((prev) => {
        const newGameState = prev.map((row, rowIndex) =>
          row.map((cell, colIndex) =>
            rowIndex * 3 + colIndex === id ? currentPlayer : cell
          )
        );
        return newGameState;
      });
      setcurrentPlayer(currentPlayer === 'circle' ? 'cross' : 'circle');
    }
  };

  const conditionalClass = finishedArrayState.includes(id) ? (finishState === 'circle' ? 'bg-[#DD7F9F]' : 'bg-[#4B495F]') : '';

  return (
    <div
      onClick={handleClick}
      className={`bg-[#4B495F] h-[100px] w-[100px] rounded-lg`}
    >
      <div className={`flex justify-center items-center ${finishedArrayState.includes(id)?finishState+'-won':''}`}>
        {icon}
      </div>
    </div>
  );
};

export default Square;
