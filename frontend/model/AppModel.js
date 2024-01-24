
const appHost = 4323;
export default class AppModel {

    static async getBillboards() {
        try{
            const billboardResponse = await fetch(`http://localhost:${appHost}/billboards`); // get запрос по-умолчанию
            const billboardsBody = await billboardResponse.json();

            if(billboardResponse.status !== 200){
                return Promise.reject(billboardsBody);
            }

            return billboardsBody.billboards;
        } catch(err){
            return Promise.reject({
                timestamp: new Date().toISOString(),
                statusCode: 0,
                message: err.message
            });
        }
    }


    static async addBillBoard({BillboardID, addres} = {
        BillboardID: null,
        addres: ''
    }) {
        try{
            console.log("crypto", BillboardID)
            const addbillboardResponse = await fetch(
                `http://localhost:${appHost}/billboards`,
                {
                    method: 'POST',
                    body: JSON.stringify({BillboardID, addres}),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            ); // get запрос по-умолчанию

            if(addbillboardResponse.status !== 200){
                const addTaslistkBody = await addbillboardResponse.json();
                return Promise.reject(addTaslistkBody);
            }

            return {
                timestamp: new Date().toISOString(),
                message: `Task list '${name}' was successfully added to list of task lists`
            };
        } catch(err){
            return Promise.reject({
                timestamp: new Date().toISOString(),
                statusCode: 0,
                message: err.message
            });
        }
    }
    

    static async addTask({taskID, name_advert, date_start, date_end, BillboardID} = {
        taskID: null, 
        name_advert: '',
        date_start: null,
        date_end: null,
        BillboardID: null
    }) {
        try{
            const addTaskResponse = await fetch(
                `http://localhost:${appHost}/tasks`,
                {
                    method: 'POST',
                    body: JSON.stringify({taskID, name_advert, date_start, date_end, BillboardID}),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            ); // get запрос по-умолчанию

            if(addTaskResponse.status !== 200){
                const addTaskBody = await addTaskResponse.json();
                return Promise.reject(addTaskBody);
            }

            return {
                timestamp: new Date().toISOString(),
                message: `Task '${name_advert}' was successfully added to list of tasks`
            };
        } catch(err){
            return Promise.reject({
                timestamp: new Date().toISOString(),
                statusCode: 0,
                message: err.message
            });
        }
    }

    
    static async updateTask({taskID, name_advert, date_start, date_end} = {
        taskID: null,
        name_advert: '',
        date_start: null,
        date_end: null
    }) {
        try{
            const updateTaskResponse = await fetch(
                `http://localhost:${appHost}/tasks/${taskID}`,
                {
                    method: 'PATCH',
                    body: JSON.stringify({taskID, name_advert, date_start, date_end}),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            ); // get запрос по-умолчанию
            console.log("fetch");
            if(updateTaskResponse.status !== 200){
                const updateTaskBody = await updateTaskResponse.json();
                return Promise.reject(updateTaskBody);
            }

            return {
                timestamp: new Date().toISOString(),
                message: `Task '${name_advert}' was successfully update`
            };
        } catch(err){
            return Promise.reject({
                timestamp: new Date().toISOString(),
                statusCode: 0,
                message: err.message
            });
        }
    }


    static async updateTasks({reorderedTasks = []} = {
        reorderedTasks: []
    }) {
        try{
            const updateTasksResponse = await fetch(
                `http://localhost:${appHost}/tasks`,
                {
                    method: 'PATCH',
                    body: JSON.stringify({ reorderedTasks}),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            ); // get запрос по-умолчанию

            if(updateTasksResponse.status !== 200){
                const updateTasksBody = await updateTasksResponse.json();
                return Promise.reject(updateTasksBody);
            }

            return {
                timestamp: new Date().toISOString(),
                message: `Task was successfully changed`
            };
        } catch(err){
            return Promise.reject({
                timestamp: new Date().toISOString(),
                statusCode: 0,
                message: err.message
            });
        }
    }


    static async deleteTask({taskID } = {
        taskID: null
    }) {
        try{
            const deleteTaskResponse = await fetch(
                `http://localhost:${appHost}/tasks/${taskID}`,
                {
                    method: 'DELETE'
                }
            ); // get запрос по-умолчанию

            if(deleteTaskResponse.status !== 200){
                const deleteTaskBody = await deleteTaskResponse.json();
                return Promise.reject(deleteTaskBody);
            }

            return {
                timestamp: new Date().toISOString(),
                message: `Task (ID = '${taskID}') was successfully delete from task list`
            };
        } catch(err){
            return Promise.reject({
                timestamp: new Date().toISOString(),
                statusCode: 0,
                message: err.message
            });
        }
    }


    static async deleteBillboard({BillboardID } = {
        taskID: null
    }) {
        try{
            const deleteTaskResponse = await fetch(
                `http://localhost:${appHost}/billboards/${BillboardID}`,
                {
                    method: 'DELETE'
                }
            ); // get запрос по-умолчанию

            if(deleteTaskResponse.status !== 200){
                const deleteTaskBody = await deleteTaskResponse.json();
                return Promise.reject(deleteTaskBody);
            }

            return {
                timestamp: new Date().toISOString(),
                message: `Billboard (ID = '${BillboardID}') was successfully delete from task list`
            };
        } catch(err){
            return Promise.reject({
                timestamp: new Date().toISOString(),
                statusCode: 0,
                message: err.message
            });
        }
    }


    static async updateBillboard({BillboardID, addres } = {
        taskID: null
    }) {
        try{
            const deleteTaskResponse = await fetch(
                `http://localhost:${appHost}/billboards/${BillboardID}`,
                {
                    method: 'PATCH',
                    body: JSON.stringify({ addres}),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            ); // get запрос по-умолчанию

            if(deleteTaskResponse.status !== 200){
                const deleteTaskBody = await deleteTaskResponse.json();
                return Promise.reject(deleteTaskBody);
            }

            return {
                timestamp: new Date().toISOString(),
                message: `Billboard (ID = '${BillboardID}') was successfully edited`
            };
        } catch(err){
            return Promise.reject({
                timestamp: new Date().toISOString(),
                statusCode: 0,
                message: err.message
            });
        }
    }


    static async moveTask({taskID, srcbillboardID, destbillboardID} = {
        taskID: null,
        srcbillboardID: null,
        destbillboardID: null
    }) {
        try{
            const moveTaskResponse = await fetch(
                `http://localhost:${appHost}/tasks`,
                {
                    method: 'PATCH',
                    body: JSON.stringify({taskID, srcbillboardID, destbillboardID}),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            ); // get запрос по-умолчанию

            if(moveTaskResponse.status !== 200){
                const moveTaskBody = await moveTaskResponse.json();
                return Promise.reject(moveTaskBody);
            }

            return {
                timestamp: new Date().toISOString(),
                message: `Task '${taskID}}' was successfully moved from ${srcbillboardID} to ${destbillboardID} `
            };
        } catch(err){
            return Promise.reject({
                timestamp: new Date().toISOString(),
                statusCode: 0,
                message: err.message
            });
        }
    }
}