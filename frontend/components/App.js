import Billboard from './Billboard.js';
import AppModel from '../model/AppModel.js';

export default class App {
  #billboards = [];
  #minday = 3;
  #maxday = 30;
  #minms = this.#minday * 24 * 60 * 60 * 1000;
  #maxms = this.#maxday * 24 * 60 * 60 * 1000;

  onEscapeKeydown = (event) => {
    if (event.key === 'Escape') {
      const input = document.querySelector('.tasklist-adder__input');
      input.style.display = 'none';
      input.value = '';

      document.querySelector('.tasklist-adder__btn')
        .style.display = 'inherit';
    }
  };

  onInputKeydown = async (event) => {
    if (event.key !== 'Enter') return;

    if (event.target.value) {

      const BillboardID = crypto.randomUUID();
      console.log("crypto", BillboardID)
      try{
        const addBillboardResult = await AppModel.addBillBoard({
          BillboardID,
          addres: event.target.value,
        });

        const  newTasklist = new Billboard({
          BillboardID,
          BillboardAddres: event.target.value,
          onDropTaskInTasklist: this.onDropTaskInTasklist,
          addNotification: this.addNotification
  
        });

        this.#billboards.push(newTasklist);
        newTasklist.render();

        
        this.addNotification({ text: addBillboardResult.message, type: 'success'});

      } catch (err) {
        this.addNotification({ text: err.message, type: 'error'});
        console.error(err);

      };

      
    }

    event.target.style.display = 'none';
    event.target.value = '';

    document.querySelector('.tasklist-adder__btn')
      .style.display = 'inherit';
  };

  onDropTaskInTasklist = async (evt) => {
    evt.stopPropagation();

    const destTasklistElement = evt.currentTarget;
    destTasklistElement.classList.remove('tasklist_droppable');

    const movedTaskID = localStorage.getItem('movedTaskID');
    const srcbillboardID = localStorage.getItem('srcbillboardID');
    const destbillboardID = destTasklistElement.getAttribute('id');

    localStorage.setItem('movedTaskID', '');
    localStorage.setItem('srcbillboardID', '');

    if (!destTasklistElement.querySelector(`[id="${movedTaskID}"]`)) return;

    const srcBillboard = this.#billboards.find(billboard => billboard.BillboardID === srcbillboardID);
    const destBillboard = this.#billboards.find(billboard => billboard.BillboardID === destbillboardID);

    const movedTaskDateStart = srcBillboard.tasks.find(task => task.taskID === movedTaskID).taskDateStart;
    const movedTaskDateEnd = srcBillboard.tasks.find(task => task.taskID === movedTaskID).taskDateEnd;
    const date_start = new Date(movedTaskDateStart).getTime() + 10800000;
    const date_end = new Date(movedTaskDateEnd).getTime() + 10800000;
    console.log("what", srcBillboard, srcbillboardID);
    console.log("what x2", destBillboard, destbillboardID);
    console.log("what x3", movedTaskDateStart, movedTaskDateEnd);
    try {
      
      if (srcbillboardID !== destbillboardID) {
        var check = 1;
        for (var i = 0; i < destBillboard.tasks.length; i++){
          const dateStart = new Date(destBillboard.tasks[i].taskDateStart).getTime() + 10800000;
          const dateEnd = new Date(destBillboard.tasks[i].taskDateEnd).getTime() + 10800000;
          
          if (date_start <= dateEnd && date_start >= dateStart || date_end <= dateEnd && date_end >= dateStart){
            check = 0;
          }
          console.log("dates:", date_start, date_end, dateStart, dateEnd);
        }
        if (check){
          await AppModel.moveTask({
            taskID: movedTaskID,
            srcbillboardID,
            destbillboardID
          });
          // console.log('hqwjqjwq');
          const movedTask = srcBillboard.deleteTask({ taskID: movedTaskID });
          const loc_id = movedTask.BillboardID;
          console.log("move:", loc_id);
          movedTask.BillboardID = destbillboardID;
          const loc_id1 = movedTask.BillboardID;
          console.log("move:", loc_id1, srcbillboardID, destbillboardID);
          destBillboard.pushTask({ task: movedTask });
        }else{
          this.addNotification({ text: 'DATE COLLISION', type: 'error'});
          const false_move_dest = document.getElementById(movedTaskID);
          const false_billboard = document.getElementById(srcbillboardID);
          const new_back = false_move_dest;
          const querys = false_billboard.querySelectorAll('.task__contol-btn');
          querys[querys.length - 1].after(new_back)
          //false_move_dest.remove();
        }

  
        // await srcBillboard.reorderTasks();
        // console.log('hqwjqjwq');
      }
  
      // await destBillboard.reorderTasks();
      // console.log('hqwjqjwq');

      
      this.addNotification({ text: `Task (ID: ${movedTaskID}) move between billboards`, type: 'success'});
    } catch(err) {
      this.addNotification({ text: err.message, type: 'error'});
      console.error(err);

    }
  };

 

  editTask = async ({ taskID, name_advert, date_start, date_end, BillboardID }) => {

    try{
      console.log("please not here", taskID, name_advert, date_start, date_end);
      const localBillboard = this.#billboards.find(item => item.BillboardID === BillboardID);
      console.log("local", localBillboard);
      console.log("local", this.#billboards, BillboardID);
      var check = 1;
      for (var i = 0; i < localBillboard.tasks.length; i++){
        const dateStart = new Date(localBillboard.tasks[i].taskDateStart).getTime() + 10800000;
        const dateEnd = new Date(localBillboard.tasks[i].taskDateEnd).getTime() + 10800000;
        
        if (date_start <= dateEnd && date_start >= dateStart || date_end <= dateEnd && date_end >= dateStart){
          check = 0;
        }
        console.log("dates:", date_start, date_end, dateStart, dateEnd);
      }
      if (date_start<date_end){
        if (date_end - date_start >= this.#minms && date_end - date_start <= this.#maxms){
          if (check){
            const updateTaskResult = await AppModel.updateTask({ taskID, name_advert, date_start, date_end});
            console.log("here?");
            document.querySelector(`[id="${taskID}"] h1.task__text1`).innerHTML = `ФИО: ${name_advert}`;
            document.querySelector(`[id="${taskID}"] h1.task__text2`).innerHTML = `Начало аренды: ${new Date(date_start).toISOString().slice(0,10)}`;
            document.querySelector(`[id="${taskID}"] h1.task__text3`).innerHTML = `Конец аренды: ${new Date(date_end).toISOString().slice(0,10)}`;
            console.log(updateTaskResult);
            this.addNotification({ text: updateTaskResult.message, type: 'success'});
          }else{
              this.addNotification({ text: 'DATE COLLISION', type: 'error'});
            }
        }else{
          this.addNotification({text: `WRONG DATES, DAY AMOUNT MUST BE > ${this.#minday} AND < ${this.#maxday}`, type: 'error'});
        }
      }else{
        this.addNotification({text: 'WRONG DATES, END DATE MUST BE > START DATE', type: 'error'});
      }

    } catch (err) {
      this.addNotification({ text: err.message, type: 'error'});
      console.error(err);
    }  
  };

  editBillboard = async ({ BillboardID, newTaskText }) => {

    try{
      console.log("being edited", BillboardID);
      const updateTaskResult = await AppModel.updateBillboard({ BillboardID, addres: newTaskText});

      document.querySelector(`[id="${BillboardID}"] h2.tasklist__name`).innerHTML = newTaskText;

      console.log(updateTaskResult);
      this.addNotification({ text: updateTaskResult.message, type: 'success'});
    } catch (err) {
      this.addNotification({ text: err.message, type: 'error'});
      console.error(err);
    }  
  };

  deleteTask = async ({ taskID }) => {
    let fTask = null;
    let fTasklist = null;
    for (let billboard of this.#billboards) {
      fTasklist = billboard;
      fTask = billboard.getTaskById({ taskID });
      if (fTask) break;
    }


    try{
      const deleteTaskResult = await AppModel.deleteTask({ taskID });

      fTasklist.deleteTask({ taskID });
      document.getElementById(taskID).remove();

      this.addNotification({ text: deleteTaskResult.message, type: 'success'});
    } catch (err) {
      this.addNotification({ text: err.message, type: 'error'});
      console.error(err);
    }

    
  };


  deleteBillboard = async ({ BillboardID }) => {
    try{
      const deleteTaskResult = await AppModel.deleteBillboard({ BillboardID });

      document.getElementById(BillboardID).remove();

      this.addNotification({ text: deleteTaskResult.message, type: 'success'});
    } catch (err) {
      this.addNotification({ text: err.message, type: 'error'});
      console.error(err);
    }

    
  };

  initAddTaskModal() {
    const addTaskModal = document.getElementById('modal-add-task');
    const cancelHandler = () => {
      addTaskModal.close();
      localStorage.setItem('addTaskTasklistID', '');
      addTaskModal.querySelector('.app-modal__input').value = '';
    };

    const okHandler = () => {
      const BillboardID = localStorage.getItem('addTaskTasklistID');
      console.log("BILL", BillboardID);
      const modalInput = addTaskModal.querySelector('.app-modal__input');
      const datastartInput = document.getElementById('modal-add-task-date-start');
      const dataendInput = document.getElementById('modal-add-task-date-end');
      console.log(datastartInput.value);
      console.log(dataendInput.value);
      console.log(modalInput.value);

      console.log("input", modalInput.value);
      if(BillboardID && modalInput.value){
        const date_start = new Date(datastartInput.value).getTime() + 10800000;
        const date_end = new Date(dataendInput.value).getTime()+ 10800000;
        if (date_start<date_end){
          if (date_end - date_start >= this.#minms && date_end - date_start <= this.#maxms){
            
            this.#billboards.find(billboard => billboard.BillboardID === BillboardID).appendNewTask({ 
              date_start, 
              date_end, 
              name_advert: modalInput.value});
          }else{
            this.addNotification({text: `WRONG DATES, DAY AMOUNT MUST BE > ${this.#minday} AND < ${this.#maxday}`, type: 'error'});
          }
        }else{
          this.addNotification({text: 'WRONG DATES, END DATE MUST BE > START DATE', type: 'error'});
        }
      }
      cancelHandler();
    };

    addTaskModal.querySelector('.modal-ok-btn').addEventListener('click', okHandler);
    addTaskModal.querySelector('.modal-cancel-btn').addEventListener('click', cancelHandler);
    addTaskModal.addEventListener('close', cancelHandler);
  }

  initEditTaskModal() {
    const editTaskModal = document.getElementById('modal-edit-task');
    const cancelHandler = () => {
      editTaskModal.close();
      localStorage.setItem('editTaskID', '');
      localStorage.setItem('editTaskBillID', '');
      editTaskModal.querySelector('.app-modal__input').value = '';
    };

    const okHandler = () => {
      const taskID = localStorage.getItem('editTaskID');
      const BillboardID = localStorage.getItem('editTaskBillID');
      const modalInput = document.getElementById('modal-edit-task-input');
      const datastartInput = document.getElementById('modal-add-task-date-start-edit');
      const dataendInput = document.getElementById('modal-add-task-date-end-edit');

      if(taskID && modalInput.value){
        this.editTask({taskID, 
          name_advert: modalInput.value, 
          date_start:new Date(datastartInput.value).getTime() + 10800000, 
          date_end:new Date(dataendInput.value).getTime() + 10800000,
          BillboardID
        });
      }

      cancelHandler();
    };

    editTaskModal.querySelector('.modal-ok-btn').addEventListener('click', okHandler);
    editTaskModal.querySelector('.modal-cancel-btn').addEventListener('click', cancelHandler);
    editTaskModal.addEventListener('close', cancelHandler);
  }

  initEditBillboardModal() {
    const editTaskModal = document.getElementById('modal-edit-billboard');
    const cancelHandler = () => {
      editTaskModal.close();
      localStorage.setItem('editBillboardID', '');
      editTaskModal.querySelector('.app-modal__input').value = '';
    };

    const okHandler = () => {
      const BillboardID = localStorage.getItem('editBillboardID');
      const modalInput = editTaskModal.querySelector('.app-modal__input');

      if(BillboardID && modalInput.value){
        this.editBillboard({BillboardID, newTaskText: modalInput.value});

      }

      cancelHandler();
    };

    editTaskModal.querySelector('.modal-ok-btn').addEventListener('click', okHandler);
    editTaskModal.querySelector('.modal-cancel-btn').addEventListener('click', cancelHandler);
    editTaskModal.addEventListener('close', cancelHandler);
  }

  initDeleteTaskModal() {
    const deleteTaskModal = document.getElementById('modal-delete-task');
    const cancelHandler = () => {
      deleteTaskModal.close();
      localStorage.setItem('deleteTaskID', '');
    };

    const okHandler = () => {
      const taskID = localStorage.getItem('deleteTaskID');

      if(taskID){
        this.deleteTask({taskID});

      }

      cancelHandler();
    };

    deleteTaskModal.querySelector('.modal-ok-btn').addEventListener('click', okHandler);
    deleteTaskModal.querySelector('.modal-cancel-btn').addEventListener('click', cancelHandler);
    deleteTaskModal.addEventListener('close', cancelHandler);
  }

  initDeleteBillboardModal() {
    const deleteTaskModal = document.getElementById('modal-delete-billboard');
    const cancelHandler = () => {
      deleteTaskModal.close();
      localStorage.setItem('deleteBillboardID', '');
    };

    const okHandler = () => {
      const BillboardID = localStorage.getItem('deleteBillboardID');

      if(BillboardID){
        this.deleteBillboard({BillboardID});

      }

      cancelHandler();
    };

    deleteTaskModal.querySelector('.modal-ok-btn').addEventListener('click', okHandler);
    deleteTaskModal.querySelector('.modal-cancel-btn').addEventListener('click', cancelHandler);
    deleteTaskModal.addEventListener('close', cancelHandler);
  }

  initNotifications() {
    const notifications = document.getElementById('app-notifications');
    notifications.show();
  }


  addNotification = ({text, type}) => {
    const notifications = document.getElementById('app-notifications');

    const notificationID = crypto.randomUUID();
    const notification = document.createElement('div');
    notification.classList.add(
      'notification',
      type === 'success' ? 'notification-success': 'notification-error'
    );

    notification.setAttribute('id', notificationID);
    notification.innerHTML = text;

    notifications.appendChild(notification);

    setTimeout(() => {document.getElementById(notificationID).remove();}, 5000)
  };

  async init() {
    console.log(document.getElementById("app-main"));
    document.querySelector('.tasklist-adder__btn')
      .addEventListener(
        'click',
        (event) => {
          event.target.style.display = 'none';
          const input = document.querySelector('.tasklist-adder__input');
          input.style.display = 'inherit';
          input.focus();
        }
      );

    document.addEventListener('keydown', this.onEscapeKeydown);

    document.querySelector('.tasklist-adder__input')
      .addEventListener('keydown', this.onInputKeydown);

    document.getElementById('theme-switch')
      .addEventListener('change', (evt) => {
        (evt.target.checked
          ? document.body.classList.add('dark-theme')
          : document.body.classList.remove('dark-theme'));
      });

    this.initAddTaskModal();
    this.initEditTaskModal(); 
    this.initDeleteTaskModal();
    this.initDeleteBillboardModal();
    this.initNotifications();
    this.initEditBillboardModal();

    document.addEventListener('dragover', (evt) => {
      evt.preventDefault();

      const draggedElement = document.querySelector('.task.task_selected');
      const draggedElementPrevList = draggedElement.closest('.tasklist');

      const currentElement = evt.target;
      const prevDroppable = document.querySelector('.tasklist_droppable');
      let curDroppable = evt.target;
      while (!curDroppable.matches('.tasklist') && curDroppable !== document.body) {
        curDroppable = curDroppable.parentElement;
      }

      if (curDroppable !== prevDroppable) {
        if (prevDroppable) prevDroppable.classList.remove('tasklist_droppable');

        if (curDroppable.matches('.tasklist')) {
          curDroppable.classList.add('tasklist_droppable');
        }
      }

      if (!curDroppable.matches('.tasklist') || draggedElement === currentElement) return;

      if (curDroppable === draggedElementPrevList) {
        if (!currentElement.matches('.task')) return;

        const nextElement = (currentElement === draggedElement.nextElementSibling)
          ? currentElement.nextElementSibling
          : currentElement;

        curDroppable.querySelector('.tasklist__tasks-list')
          .insertBefore(draggedElement, nextElement);

        return;
      }

      if (currentElement.matches('.task')) {
        curDroppable.querySelector('.tasklist__tasks-list')
          .insertBefore(draggedElement, currentElement);

        return;
      }

      if (!curDroppable.querySelector('.tasklist__tasks-list').children.length) {
        curDroppable.querySelector('.tasklist__tasks-list')
          .appendChild(draggedElement);
      }
    });

    try{
      const billboards = await AppModel.getBillboards();
      console.log("here", billboards);
      for(const billboard of billboards){
        console.log(billboard);
        const tasklistObj = new Billboard({
          BillboardID: billboard.BillboardID,
          BillboardAddres: billboard.addres,
          onDropTaskInTasklist: this.onDropTaskInTasklist,
          addNotification: this.addNotification
          // onEditTask: this.onEditTask,
        });

        this.#billboards.push(tasklistObj);
        tasklistObj.render();

        for( const task of billboard.tasks){
          tasklistObj.addNewTaskLocal({
            taskID: task.taskID,
            taskText: task.name_advert,
            taskDateStart: new Date(task.date_start).toISOString().substring(0, 10),
            taskDateEnd: new Date(task.date_end).toISOString().substring(0, 10),
            BillboardID: billboard.BillboardID
          });
        
        }
      }

    } catch( err) {
      this.addNotification({ text: err.message, type: 'error'});
      console.error(err);
    }
  }
};
