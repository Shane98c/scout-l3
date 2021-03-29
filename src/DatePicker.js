import React, { useState } from "react";
import DatePicker from "react-date-picker";

const DatePickerContainer = (props) => {
  const { updateDate } = props;
  const [date, setDate] = useState(new Date());

  const changeDate = (date) => {
    updateDate(date);
    setDate(date);
  };

  return (
    <div className="datePicker">
      <DatePicker
        onChange={changeDate}
        value={date}
        clearIcon={null}
        autoFocus={true}
      />
    </div>
  );
};
export default DatePickerContainer;
