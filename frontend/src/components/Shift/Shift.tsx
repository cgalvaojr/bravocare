import React from 'react';
import './Shift.css';
export default class Shift extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
    }
    render() {
        const shift = this.props.shiftData;
        return (
            <div className={!shift.isSelected ? 'shift' : 'shift highlight'} onClick={() => this.props.selectShift(shift)}>
                <div>{shift.facility_name}</div>
                <div>{shift.shift_date}</div>
                <div>{shift.start_time} - {shift.end_time}</div>
            </div>
        )
    }
}