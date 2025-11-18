import React from 'react';
import './Input.css';

function Input({
  value,
  onChange,
  placeholder = '',
  type = 'text',
  label = '',
  min,
  max,
}) {
  return (
    <div className="input-container">
      {label && <label className="input-label">{label}</label>}
      <input
        className="input"
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        min={min}
        max={max}
      />
    </div>
  );
}

export default Input;
