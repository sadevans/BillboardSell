import pg from 'pg';

export default class DB {
    #dbClient = null;
    #dbHost = '';
    #dbPort = '';
    #dbName = '';
    #dbLogin = '';
    #dbPassword = '';

    constructor(){
        this.#dbHost = process.env.DB_HOST;
        this.#dbPort = process.env.DB_PORT;
        this.#dbName = process.env.DB_NAME;
        this.#dbLogin = process.env.DB_LOGIN;
        this.#dbPassword = process.env.DB_PASSWORD;

        this.#dbClient = new pg.Client({
            user: this.#dbLogin,
            password: this.#dbPassword,
            host: this.#dbHost,
            port: this.#dbPort,
            database: this.#dbName
        })
    }

    async connect() {
        try{
            await this.#dbClient.connect();
            console.log('DB connection established');

        } catch(error){
            console.error('Unable to connect to DB: ', error);
            return Promise.reject(error);
        }
    }

    async disconnect() {
        try{
            await this.#dbClient.end();
            console.log('DB connection was closed');
            

        } catch(error){
            console.error('Unable to disconnect to DB: ', error);
            return Promise.reject(error);
            
        }
    }

    async getBillboards(){
        try {
            const orders = await this.#dbClient.query(
                'SELECT * FROM billboards;'
            );
            return orders.rows;

        } catch (error) {
            console.error('Unable get orders, error: ', error);
            return Promise.reject({
                type: 'internal',
                error
            });
        }
    }

    async getTasks(){
        try {
            const positions = await this.#dbClient.query(
                'SELECT tasks.task_id, tasks.name_advert, tasks.date_start, tasks.date_end, tasks.billboard_id FROM tasks LEFT JOIN billboards ON tasks.billboard_id = billboards.billboard_id;'
            );
            return positions.rows;

        } catch (error) {
            console.error('Unable get positions, error: ', error);
            return Promise.reject({
                type: 'internal',
                error
            });
        }
    }

    async getProducts(){
        try {
            const products = await this.#dbClient.query(
                'SELECT * FROM products ORDER BY name;'
            );
            return products.rows;

        } catch (error) {
            console.error('Unable get positions, error: ', error);
            return Promise.reject({
                type: 'internal',
                error
            });
        }
    }

    async addBillboard({
        BillboardID,
        addres
        // datetime = -1
    } = {
        BillboardID: null,
        addres: ''
        // datetime: -1
    }){
        if(!BillboardID ||!addres){
            const errMsg = `Add order error: wrong params (id: ${BillboardID},name: ${addres})`;
            console.error(errMsg);
            return Promise.reject({
                type: 'client',
                error: new Error(errMsg)
            });
        }

        try {
            await this.#dbClient.query(
                'INSERT INTO billboards (billboard_id, addres) values ($1, $2);',
                [BillboardID, addres]
            );

        } catch (error) {
            console.error('Unable add order, error: ', error);
            return Promise.reject({
                type: 'internal',
                error
            });
        }
    }

    async addTask({
        taskID,
        name_advert,
        date_start,
        date_end,
        BillboardID
    } = {
        taskID: null,
        name_advert: null,
        date_start: null,
        date_end: null,
        BillboardID: null
    }){
        if(!taskID || !name_advert || !date_start || !date_end || !BillboardID){

            const errMsg = `Add position error: wrong params (id: ${taskID})`;
            console.error(errMsg, taskID, name_advert, date_start, date_end, BillboardID);
            return Promise.reject({
                type: 'client',
                error: new Error(errMsg)
            });
        }

        try {
            await this.#dbClient.query(
                'INSERT INTO tasks (task_id, name_advert ,date_start ,date_end ,billboard_id) VALUES ($1, $2, to_timestamp($3 / 1000.0), to_timestamp($4 / 1000.0), $5);',
                [taskID, name_advert ,date_start ,date_end ,BillboardID]
            );
            await this.#dbClient.query(
                'UPDATE billboards SET tasks = array_append(tasks, $1) where billboard_id = $2;',
                [taskID, BillboardID]
            );

        } catch (error) {
            console.error('Unable add position, error: ', error);
            return Promise.reject({
                type: 'internal',
                error
            });
        }
    }

    async deleteBillboard({
        BillboardID
    } = {
        BillboardID: null
    }){
        if(!BillboardID){
            const errMsg = `Delete order error: wrong params (id: ${BillboardID})`;
            console.error(errMsg);
            return Promise.reject({
                type: 'client',
                error: new Error(errMsg)
            });
        }
        
        try {
            await this.#dbClient.query(
                'DELETE FROM tasks WHERE billboard_id = $1;',
                [BillboardID]
            );
            await this.#dbClient.query(
                'DELETE FROM billboards WHERE billboard_id = $1;',
                [BillboardID]
            );

        } catch (error) {
            console.error('Unable delete billboard, error: ', error);
            return Promise.reject({
                type: 'internal',
                error
            });
        }
    }

    async deleteTask({
        taskID
    } = {
        taskID: null
    }){
        if(!taskID){
            const errMsg = `Delete task error: wrong params (task_id: ${taskID})`;
            console.error(errMsg);
            return Promise.reject({
                type: 'client',
                error: new Error(errMsg)
            });
        }
        
        try {
            const queryResult = await this.#dbClient.query(
                'SELECT billboard_id FROM tasks WHERE task_id = $1;',
                [taskID]
            );
            const {billboard_id:BillboardID} = queryResult.rows[0];
            
            await this.#dbClient.query(
                'DELETE FROM tasks WHERE task_id = $1;',
                [taskID]
            );
            await this.#dbClient.query(
                'UPDATE billboards SET tasks = array_remove(tasks, $1) WHERE billboard_id = $2;',
                [taskID, BillboardID]
            );

        } catch (error) {
            console.error('Unable delete task, error: ', error);
            return Promise.reject({
                type: 'internal',
                error
            });
        }
    }

    async updateBillboard({
        BillboardID,
        addres
        
    } = {
        BillboardID: null,
        addres: ''
    }){
        if(!addres || !BillboardID){
            const errMsg = `Update order error: wrong params (id: ${BillboardID}, addres: ${addres})`;
            console.error(errMsg);
            return Promise.reject({
                type: 'client',
                error: new Error(errMsg)
            });
        }

        let query = null;
        const queryParams = [];

        if(addres){
            query = 'UPDATE billboards SET addres = $1 WHERE billboard_id = $2;';
            queryParams.push(addres, BillboardID);
        } 

        try {
            await this.#dbClient.query(
                query,
                queryParams
            );
        } catch (error) {
            console.error('Unable update billboard, error: ', error);
            return Promise.reject({
                type: 'internal',
                error
            });
        }
    }


    async updateTask({
        taskID,
        name_advert,
        date_start,
        date_end
        
    } = {
        taskID: null,
        name_advert: '',
        date_start: null,
        date_end: null
    }){
        if(!name_advert || !date_start || !date_end || !taskID){
            const errMsg = `Update order error: wrong params (id: ${taskID}, name_advert: ${name_advert})`;
            console.error(errMsg);
            return Promise.reject({
                type: 'client',
                error: new Error(errMsg)
            });
        }

        let query = null;
        const queryParams = [];

        query = 'UPDATE tasks SET name_advert=$1, date_start=to_timestamp($2 / 1000.0), date_end=to_timestamp($3 / 1000.0) WHERE task_id = $4;';
        queryParams.push(name_advert, date_start, date_end, taskID);

        try {
            await this.#dbClient.query(
                query,
                queryParams
            );
        } catch (error) {
            console.error('Unable update task, error: ', error);
            return Promise.reject({
                type: 'internal',
                error
            });
        }
    }


    async moveTask({
        taskID,
        srcbillboardID,
        destbillboardID
    } = {
        taskID: null,
        srcbillboardID: null,
        destbillboardID: null
    }){
        if(!taskID || !srcbillboardID || !destbillboardID){
            const errMsg = `Move position error: wrong params (taskID: ${taskID}, srcbillboardID: ${srcbillboardID}, destbillboardID: ${destbillboardID})`;
            console.error(errMsg);
            return Promise.reject({
                type: 'client',
                error: new Error(errMsg)
            });
        }

        try {
            await this.#dbClient.query(
                'UPDATE tasks SET billboard_id = $1 WHERE task_id = $2;',
                [destbillboardID, taskID]
            );
            await this.#dbClient.query(
                'UPDATE billboards SET tasks = array_append(tasks, $1) WHERE billboard_id = $2;',
                [taskID, destbillboardID]
            );
            await this.#dbClient.query(
                'UPDATE billboards SET tasks = array_remove(tasks, $1) WHERE billboard_id = $2;',
                [taskID, srcbillboardID]
            );

        } catch (error) {
            console.error('Unable move task, error: ', error);
            return Promise.reject({
                type: 'internal',
                error
            });
        }
    }
}