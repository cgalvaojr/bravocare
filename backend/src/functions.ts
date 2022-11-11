export default class Functions
{
    getMaximunOverlapThreshold (firstShift, secondShift): Number {
        return firstShift.facility_id === secondShift.facility_id ? 30 : 0;
    }

    getOverlapMinutes(firstShift, secondShift) {
        const endDate = new Date(`2022-11-01 ${firstShift.end_time}`)
        const startDate = new Date(`2022-11-01 ${secondShift.start_time}`);

        return this.diffMinutes(endDate, startDate);

    }

    diffMinutes(dt2, dt1){
        var diff =(dt2.getTime() - dt1.getTime()) / 1000;
        diff /= 60;
        return Math.abs(Math.round(diff));
    }

    exceededOverlapTreshold(maxOVerlapMinutes, overlapedMinutes) {
        return overlapedMinutes > maxOVerlapMinutes;
    }
}