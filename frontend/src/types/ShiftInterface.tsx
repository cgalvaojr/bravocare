export default interface ShiftInterface {
    "shift_id": number,
    "facility_id": number,
    "shift_date": string,
    "start_time": string,
    "end_time": string,
    "facility_name": string,
    isSelected? : boolean
}