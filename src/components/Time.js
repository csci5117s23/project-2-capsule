import React, { useState } from 'react';
import TimePicker from 'rc-time-picker';
import 'rc-time-picker/assets/index.css';

const Time = ({ onTimeChange }) => {
  const [time, setTime] = useState(null);

  const handleChange = (value) => {
    setTime(value);
    onTimeChange(value);
  };

  return (
    <TimePicker
      showSecond={false}
      onChange={handleChange}
      value={time}
      format='h:mm a'
      use12Hours
    />
  );
};

export default Time;
