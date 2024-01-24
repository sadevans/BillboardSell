import dotenv from 'dotenv';
import express, { response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url'
import DB from './db/client.js';
import { timeStamp } from 'console';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url); //полный путь к файлу
const __dirname = path.dirname(__filename);   //полный путь к директории

dotenv.config(
    {
        path: './backend/.env'
    }
);

const appHost = process.env.APP_HOST;
const appPort = process.env.APP_PORT;

const app = express();
const db = new DB();

// Логгирующуя прослойка
app.use('*', (req, res, next) => {
    console.log(
        req.method,
        req.baseUrl || req.url,
        new Date().toISOString()
    );
    next(); // следующий обработчик
});

// Прослойка для статических файлов
app.use('/', express.static(path.resolve(__dirname, '../dist')));

// get billboards, positions and products
app.get('/billboards', async (req, res) => {
    try {
        const [dbBillboards, dbTasks] = await Promise.all([db.getBillboards(),db.getTasks()]);
        
        const tasks = dbTasks.map(({task_id, name_advert, date_start, date_end, billboard_id}) => ({
            taskID: task_id, name_advert, date_start, date_end, billboard_id
        })); 

        const billboards = dbBillboards.map(billboard => ({
            BillboardID: billboard.billboard_id,
            addres: billboard.addres,
            tasks: tasks.filter(task => billboard.tasks.indexOf(task.taskID) !== -1)
        }));


        res.statusCode = 200;
        res.statusMessage = 'OK';
        res.json({ billboards});

    } catch (err) {
        res.statusCode = 500;
        res.statusMessage = 'Internal server error';
        res.json({
            timestamp: new Date().toISOString(),
            statusCode: 500,
            message: `Getting billboards and positions error: ${err.error.message || err.error}`
        });
    }
});

// body parsing middleware
app.use('/billboards', express.json())
// add order
app.post('/billboards', async (req, res) => {
    try{
        const {BillboardID, addres} = req.body;
        await db.addBillboard({BillboardID, addres});
        res.statusCode = 200;
        res.statusMessage = 'OK';
        res.send();

    } catch(err) {
        switch(err.type){
            case 'client':
                res.statusCode = 400;
                res.statusMessage = 'Bad request';
                break;
            default:
                res.statusCode = 500;
                res.statusMessage = 'Internal server error';
        }
        
        res.json({
            timestamp: new Date().toISOString(),
            statusCode: res.statusCode,
            message: `Add order error: ${err.error.message || err.error}`
        });
    }
});

// body parsing middleware
app.use('/tasks', express.json())
// add position
app.post('/tasks', async (req, res) => {
    try{
        const { taskID, name_advert, date_start, date_end, BillboardID } = req.body;
        // const start = new Date().getTime();
        // const end = new Date().getTime();
        await db.addTask({ taskID, name_advert, date_start, date_end, BillboardID });
        res.statusCode = 200;
        res.statusMessage = 'OK';
        res.send();

    } catch(err) {
        switch(err.type){
            case 'client':
                res.statusCode = 400;
                res.statusMessage = 'Bad request';
                break;
            default:
                res.statusCode = 500;
                res.statusMessage = 'Internal server error';
        }
        
        res.json({
            timestamp: new Date().toISOString(),
            statusCode: res.statusCode,
            message: `Add position error: ${err.error}`
        });
    }
});

// body parsing middleware
app.use('/billboards/:billboardID', express.json());
// edit Order params
app.patch('/billboards/:billboardID', async (req, res) => {
    try{
        const { billboardID } = req.params;
        const { addres } = req.body;
        await db.updateBillboard({ BillboardID:billboardID, addres});
        res.statusCode = 200;
        res.statusMessage = 'OK';
        res.send();

    } catch(err) {
        switch(err.type){
            case 'client':
                res.statusCode = 400;
                res.statusMessage = 'Bad request';
                break;
            default:
                res.statusCode = 500;
                res.statusMessage = 'Internal server error';
        }
        
        res.json({
            timestamp: new Date().toISOString(),
            statusCode: res.statusCode,
            message: `Update order params error: ${err.error.message || err.error}`
        });
    }
});


// body parsing middleware
app.use('/tasks/:taskID', express.json());
// edit Order params
app.patch('/tasks/:taskID', async (req, res) => {
    try{
        const { taskID } = req.params;
        const { name_advert, date_start, date_end } = req.body;

        
        await db.updateTask({ taskID, name_advert, date_start, date_end});
        res.statusCode = 200;
        res.statusMessage = 'OK';
        res.send();

    } catch(err) {
        switch(err.type){
            case 'client':
                res.statusCode = 400;
                res.statusMessage = 'Bad request';
                break;
            default:
                res.statusCode = 500;
                res.statusMessage = 'Internal server error';
        }
        
        res.json({
            timestamp: new Date().toISOString(),
            statusCode: res.statusCode,
            message: `Update order params error: ${err.error.message || err.error}`
        });
    }
});


// move Position between tasklists
app.patch('/tasks', async (req, res) => {
    try{
        const { taskID, srcbillboardID, destbillboardID } = req.body;
        await db.moveTask({ taskID, srcbillboardID, destbillboardID });

        res.statusCode = 200;
        res.statusMessage = 'OK';
        res.send();

    } catch(err) {
        switch(err.type){
            case 'client':
                res.statusCode = 400;
                res.statusMessage = 'Bad request';
                break;
            default:
                res.statusCode = 500;
                res.statusMessage = 'Internal server error';
        }
        
        res.json({
            timestamp: new Date().toISOString(),
            statusCode: res.statusCode,
            message: `Move position error: ${err.error.message || err.error}`
        });
    }
})

// delete billboard
app.delete('/billboards/:billboardID', async (req, res) => {
    try{
        const { billboardID } = req.params;
        await db.deleteBillboard({ BillboardID:billboardID });

        res.statusCode = 200;
        res.statusMessage = 'OK';
        res.send();

    } catch(err) {
        switch(err.type){
            case 'client':
                res.statusCode = 400;
                res.statusMessage = 'Bad request';
                break;
            default:
                res.statusCode = 500;
                res.statusMessage = 'Internal server error';
        }
        
        res.json({
            timestamp: new Date().toISOString(),
            statusCode: res.statusCode,
            message: `Delete order error: ${err.error.message || err.error}`
        });
    }
});

// delete task
app.delete('/tasks/:taskID', async (req, res) => {
    try{
        const { taskID } = req.params;
        await db.deleteTask({ taskID });

        res.statusCode = 200;
        res.statusMessage = 'OK';
        res.send();

    } catch(err) {
        switch(err.type){
            case 'client':
                res.statusCode = 400;
                res.statusMessage = 'Bad request';
                break;
            default:
                res.statusCode = 500;
                res.statusMessage = 'Internal server error';
        }
        
        res.json({
            timestamp: new Date().toISOString(),
            statusCode: res.statusCode,
            message: `Delete position error: ${err.error.message || err.error}`
        });
    }
});

const server = app.listen(Number(appPort), appHost, async () => {
    try{
        await db.connect()
    } catch(error){
        console.log('Task manager app shut down');
        process.exit(100);
    }

    console.log(`Task manager app started at host http://${appHost}:${appPort}`);

    // console.log(Date.now());

    // let billboardID = crypto.randomUUID();

    // await db.addOrder({ billboardID, name: 'Никольский Александр': Date.now() });
    // await db.addPosition({ taskID: crypto.randomUUID(), count: 12, billboardID, productID: '9866fcab-ef56-490f-b3b3-d658faa0e034' });
    // await db.addPosition({ taskID: crypto.randomUUID(), count: 12, billboardID: '88ec4f4a-05e1-4433-beb5-67b0c55d8318', productID: '9866fcab-ef56-490f-b3b3-d658faa0e034' });
    // await db.deleteOrder({billboardID: '0d0716b5-4431-4b5f-96b3-7683b9facccf'});
    // await db.deletePosition({taskID: '42113f54-d7c9-446a-b8eb-f3bfe6155f41'});
    // await db.updateOrder({billboardID: '351acabd-c012-4491-be7c-5ac079e34cb5': Date.now()});
    // await db.movePosition({ taskID: 'a26d4a96-50d9-4cb8-a960-563665e75f74', srcbillboardID: '88ec4f4a-05e1-4433-beb5-67b0c55d8318', destbillboardID: '00208aff-2c97-4f47-970f-8e95d4e3763f' });

    console.log(await db.getBillboards());
    console.log(await db.getTasks());

    // server.close(async () => {
    //     await db.disconnect();
    //     console.log('HTTP server closed');
    // });
});

process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closed HTTP server')
    server.close(async () => {
        await db.disconnect();
        console.log('HTTP server closed');
    });
});