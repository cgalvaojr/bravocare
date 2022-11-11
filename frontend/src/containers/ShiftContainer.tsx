import React from 'react';
import Shift from "../components/Shift/Shift";
import ShiftCompareResults from "../components/ShiftCompare/ShiftCompareResults";
import ShiftInterface from "../types/ShiftInterface";
import './ShiftContainer.css';

export default class ShiftContainer extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
        this.state = {
            shifts: [],
            selectedShifts: [],
            results: {
                totalOverlapedMinutes: '',
                overlapMinutesPermitted: '',
                isExceededOverlapThreshold: ''
            }
        };
        this.selectShift = this.selectShift.bind(this);
        this.verifyMaxOverlapThreshold = this.verifyMaxOverlapThreshold.bind(this);
        this.executeQuery = this.executeQuery.bind(this);

    }
    componentDidMount() {
       this.getShifts();
    }

    executeQuery(queryNumber: number) {
        const headers = new Headers();
        headers.append('Content-Type', 'application/json');
        headers.append('Accept', 'application/json');

        headers.append('Access-Control-Allow-Origin', 'http://localhost:3000');

        fetch(`http://localhost:4000/question-${queryNumber}`, {headers})
            .then(function(response) {
                return response.json();
            })
            .then((jsonData) => {
                console.info(jsonData);
            })
    }

    getShifts() {
        const headers = new Headers();
        headers.append('Content-Type', 'application/json');
        headers.append('Accept', 'application/json');

        headers.append('Access-Control-Allow-Origin', 'http://localhost:3000');

        fetch('http://localhost:4000/shift', {headers})
            .then(function(response) {
                return response.json();
            })
            .then((jsonData) => {
                jsonData.map((shift: ShiftInterface) => {
                    const startTimeString = new Date(`${shift.shift_date}T${shift.start_time}Z`)
                        .toLocaleTimeString('en-US',
                            {timeZone:'UTC',hour12:true,hour:'numeric',minute:'numeric'}
                        );

                    const endTimeString = new Date(`${shift.shift_date}T${shift.end_time}Z`)
                        .toLocaleTimeString('en-US',
                            {timeZone:'UTC',hour12:true,hour:'numeric',minute:'numeric'}
                        );

                    shift.start_time = startTimeString;
                    shift.end_time = endTimeString;
                });
                this.setState({ shifts: jsonData });
            })
    }
    unselectShift(shiftToUnselect: ShiftInterface) {
        let allShifts = this.state.shifts;
        let selectedShifts = this.state.selectedShifts;

        allShifts.map((shift: ShiftInterface) => {
            if(shift.shift_id === shiftToUnselect.shift_id) {
                shift.isSelected = false;
            }
        })

        selectedShifts = selectedShifts.filter((selectedShift: ShiftInterface) => selectedShift.shift_id !== shiftToUnselect.shift_id);
        this.setState({
            shifts: allShifts,
            selectedShifts: selectedShifts
        })
    }

    selectShift(shift: ShiftInterface) {
        const selectedShifts = this.state.selectedShifts;
        const foundShift = selectedShifts.find((selectedShift: ShiftInterface) => selectedShift.shift_id === shift.shift_id);
        if(foundShift) {
            return this.unselectShift(foundShift);
        }

        if(selectedShifts.length < 2) {
            shift.isSelected = true;
            selectedShifts.push(shift)
            this.setState({
                selectedShifts: selectedShifts
            })
        }
    }

    verifyMaxOverlapThreshold() {
        if(this.state.selectedShifts.length === 2) {
            const headers = new Headers();
            headers.append('Content-Type', 'application/json');
            headers.append('Accept', 'application/json');
            headers.append('Access-Control-Allow-Origin', 'http://localhost:3000');

            const formData = new FormData();
            formData.append('firstShift', this.state.selectedShifts[0]);
            formData.append('secondShift', this.state.selectedShifts[1]);

            const params = {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Access-Control-Allow-Origin': 'http://localhost:3000',
                },
                method: 'POST',
                body: JSON.stringify({
                    firstShift: this.state.selectedShifts[0],
                    secondShift: this.state.selectedShifts[1],
                })
            }

            fetch('http://localhost:4000/verify-overlap-threshhold', params )
                .then(function(response) {
                    return response.json();
                })
                .then((jsonData) => {
                    this.setState({
                        results: jsonData
                    })
                })
        }
    }

    render() {
        const shifts = this.state.shifts;
        return (
            shifts && <div>
                <h1>Shifts</h1>
                <ShiftCompareResults results={this.state.results}>
                    <input type='button' onClick={() => this.verifyMaxOverlapThreshold()} value='Submit' />
                </ShiftCompareResults>
                <div className='shift-container'>
                    {
                        shifts.map((shift: any) => {
                            return <Shift selectShift={this.selectShift} key={shift.shift_id} shiftData={shift} />
                        })
                    }
                    <br />
                </div>

                <hr style={{marginTop: '35px'}}/>
                <div className='querys-container'>
                    <input type='button' value='Execute Q4 Query' onClick={() => this.executeQuery(4)}/>
                    <input type='button' value='Execute Q5 Query' onClick={() => this.executeQuery(5)} />
                    <input type='button' value='Execute Q6 Query' onClick={() => this.executeQuery(6)}/>
                </div>
            </div>
        );
    }
}