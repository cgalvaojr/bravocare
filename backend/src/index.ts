import express, { Express, Request, Response } from 'express';
import BodyParser from 'body-parser';
import * as dotenv from 'dotenv';
import cors from "cors";

dotenv.config({path: __dirname + '/.env'});

dotenv.config();

const app: Express = express();

const allowedOrigins = ['http://localhost:3000'];

const options: cors.CorsOptions = {
    origin: allowedOrigins
};

app.use(BodyParser.json());
app.use(cors<Request>(options));

const port = process.env.port;
import {
    Sequelize
} from 'sequelize';

import Functions from "./functions";
const sequelize = new Sequelize('postgresql://devuser:devsecret@bravocare-db/devdb');

app.get('/shift', async (req: Request, res: Response) => {
    try {
        const sql = 'select s.*, f.facility_name from question_one_shifts s join facilities f using(facility_id)';
        const shifts = await sequelize.query(sql);
        res.send(shifts[0]);
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
});

app.post('/verify-overlap-threshhold', async (req: Request, res: Response) => {
    try {
        const params = req.body;

        if(params.firstShift && params.secondShift) {
            const functions = new Functions();
            const overlapMinutesPermitted = functions.getMaximunOverlapThreshold(params.firstShift, params.secondShift);
            const totalOverlapedMinutes = functions.getOverlapMinutes(params.firstShift, params.secondShift)
            const isExceededOverlapThreshold = functions.exceededOverlapTreshold(overlapMinutesPermitted, totalOverlapedMinutes)

            res.send({
                overlapMinutesPermitted,
                totalOverlapedMinutes,
                isExceededOverlapThreshold
            });
        }
    } catch (error) {
        console.error(error);
    }
});

app.get('/question-4', async (req: Request, res: Response) => {
    try {
        const sql = "select\n" +
            "\tdistinct on (j.nurse_type_needed, j.facility_id)\n" +
            "\tj.facility_id ,\n" +
            "\tj.nurse_type_needed,\n" +
            "\tSUM(j.total_number_nurses_needed) as total_number_nurses_needed,\n" +
            "\t(SUM(j.total_number_nurses_needed) - (\n" +
            "\t\tselect  distinct on (facility_id)\n" +
            "\t\tcount(n.nurse_type) as hired_nurses\n" +
            "\t\tfrom nurse_hired_jobs nhj \n" +
            "\t\tinner join nurses n using (nurse_id)\n" +
            "\t\tinner join jobs j2 using(job_id)\n" +
            "\t\twhere n.nurse_type = j.nurse_type_needed and facility_id = j.facility_id \n" +
            "\t\tgroup by facility_id, nurse_type\n" +
            "\t) ) as remaining_spots\n" +
            "from jobs j\n" +
            "group by j.facility_id , j.nurse_type_needed\n" +
            "order by j.facility_id, j.nurse_type_needed;";
        const [remainingSpots] = await sequelize.query(sql);
        res.send(remainingSpots);
    } catch (error) {
        console.error(error);
    }
});

app.get('/question-5', async (req: Request, res: Response) => {
    try {
        const sql = "select \n" +
            "\tnurse_id,\n" +
            "\tnurse_name,\n" +
            "\tnurse_type,\n" +
            "\tSUM((\n" +
            "\t\tselect\n" +
            "\t\t\tcount(*)\n" +
            "\t\tfrom jobs j\n" +
            "\t\twhere \n" +
            "\t\t\tj.nurse_type_needed = n.nurse_type and\n" +
            "\t\t\tn.nurse_id not in (select nurse_id from nurse_hired_jobs nhj where nhj.job_id = j.job_id)\n" +
            "\t)+1) as total_available_jobs\n" +
            "from\n" +
            "\tnurses n\n" +
            "\tgroup by nurse_id\n" +
            "order by n.nurse_id;";
        const [results] = await sequelize.query(sql);
        res.send(results);
} catch (error) {
    console.error(error);
}
});

app.get('/question-6', async (req: Request, res: Response) => {
    try {
        const sql = "select \n" +
            "\tdistinct nurse_name\n" +
            "from \n" +
            "\tnurses n\n" +
            "inner join nurse_hired_jobs nhj on n.nurse_id = nhj.nurse_id \n" +
            "inner join jobs j on j.job_id = nhj.job_id \n" +
            "inner join facilities f on f.facility_id = j.facility_id\n" +
            "where \n" +
            "\tf.facility_id = (\n" +
            "\t\tselect\n" +
            "\t\tf.facility_id\n" +
            "\tfrom\n" +
            "\t\tnurses n \n" +
            "\tinner join nurse_hired_jobs nhj on n.nurse_id = nhj.nurse_id \n" +
            "\tinner join jobs j on j.job_id = nhj.job_id \n" +
            "\tinner join facilities f on f.facility_id = j.facility_id\n" +
            "\twhere n.nurse_id  = 1001 \n" +
            ")\n" +
            "and n.nurse_id <> 1001;";
        const [coWorkers] = await sequelize.query(sql);
        res.send(coWorkers);
    } catch (error) {
        console.error(error);
    }
});

app.listen(port, () => {
    console.log(`⚡ [server]: Server is running at https://localhost:${port}`);
});