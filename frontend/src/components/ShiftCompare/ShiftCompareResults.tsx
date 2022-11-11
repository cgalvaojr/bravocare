import React from 'react';
import './ShiftCompareResult.css';
export default class ShiftCompareResults extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
    }
    render() {
        let { results, children } = this.props;

        return (
            <div className='shift-compare-results'>
                <div>Overlap Minutes: { results.totalOverlapedMinutes }</div>
                <div>Max Overlap Threshold: { results.overlapMinutesPermitted }</div>
                <div>Exceeds Overlap Threshold: { String(results.isExceededOverlapThreshold) }</div>
                <div>{ children }</div>
            </div>
        )
    }
}