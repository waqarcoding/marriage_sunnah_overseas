import React from 'react';

const Button = ({ children, onClick, className = '', style = {} }) => (
    <button className={`className`} style={style} onClick={onClick}>{children}</button>
);

export default Button;