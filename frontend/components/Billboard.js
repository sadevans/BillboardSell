import Task from './Task';
import AppModel from '../model/AppModel';
export default class Billboard {
  #tasks = [];
  #BillboardAddres = '';
  #BillboardID = null;


  constructor({
    BillboardID = null,
    BillboardAddres,
    onDropTaskInTasklist,
    addNotification
  }) {
    this.#BillboardAddres = BillboardAddres;
    this.#BillboardID = BillboardID || crypto.randomUUID();
    console.log("xx", BillboardID)
    this.onDropTaskInTasklist = onDropTaskInTasklist;
    this.addNotification = addNotification
  }

  get BillboardID() { return this.#BillboardID; }
  get tasks() { return this.#tasks; }
  
  pushTask = ({ task }) => this.#tasks.push(task);

  getTaskById = ({ taskID }) => this.#tasks.find(task => task.taskID === taskID);

  deleteTask = ({ taskID }) => {
    const deleteTaskIndex = this.#tasks.findIndex(task => task.taskID === taskID);

    if (deleteTaskIndex === -1) return;

    const [deletedTask] = this.#tasks.splice(deleteTaskIndex, 1);

    return deletedTask;
  };

  reorderTasks = async () => {
    console.log(document.querySelector(`[id="${this.#BillboardID}"] .tasklist__tasks-list`));
    const orderedTasksIDs = Array.from(
      document.querySelector(`[id="${this.#BillboardID}"] .tasklist__tasks-list`).children,
      elem => elem.getAttribute('id')
    );


    const reorderedTasksInfo = [];

    orderedTasksIDs.forEach((taskID, position) => {
      const task = this.#tasks.find(task => task.taskID === taskID);
      if(task.taskPosition !== position){
        task.taskPosition = position;
        reorderedTasksInfo.push({
          taskID,
          position
        });
      }
    });

    if(reorderedTasksInfo.length > 0){
      try{
        await AppModel.updateTasks({
          reorderedTasks: reorderedTasksInfo
        });
      } catch(err){
        this.addNotification({ text: err.message, type: 'error'});
        console.error(err);
      }

    }

    console.log(this.#tasks);
  };

  appendNewTask = async ({ name_advert, date_start, date_end }) => {
    
    console.log("am i supposed to be here?");
    try {
      console.log("x3", this.#BillboardID)
      let check = 1;
      for (let i = 0; i < this.#tasks.length; i++){
        const dateStart = new Date(this.#tasks[i].taskDateStart).getTime() + 10800000;
        const dateEnd = new Date(this.#tasks[i].taskDateEnd).getTime() + 10800000;
        
        if (date_start <= dateEnd && date_start >= dateStart || date_end <= dateEnd && date_end >= dateStart){
          check = 0;
        }
        console.log("dates:", date_start, date_end, dateStart, dateEnd);
      }
      if (check){      
        const taskID = crypto.randomUUID();
        const addTaskResult = await AppModel.addTask({
          taskID: taskID,
          name_advert, 
          date_start, 
          date_end,
          BillboardID: this.#BillboardID
        });
        console.log("am i supposed to be here?", this.#BillboardID);
        this.addNewTaskLocal({
          taskID,
          taskText: name_advert, 
          taskDateStart: new Date(date_start).toISOString().slice(0,10), 
          taskDateEnd: new Date(date_end).toISOString().slice(0,10),
          BillboardID: this.#BillboardID,
        });
  
        this.addNotification({ text: addTaskResult.message, type: 'success'});
      }else{
        this.addNotification({ text: 'DATE COLLISION', type: 'error'});
      }

    } catch (err) {
      this.addNotification({ text: err.message, type: 'error'});
      console.error(err);
    }

    
  };


  addNewTaskLocal = ({taskID = null, taskText, taskDateStart, taskDateEnd, BillboardID}) => {
    console.log("here", BillboardID);
    const newTask = new Task({
      taskID,
      taskText,
      taskDateStart, 
      taskDateEnd,
      BillboardID
    });
    this.#tasks.push(newTask);

    const newTaskElement = newTask.render();
    document.querySelector(`[id="${this.#BillboardID}"] .tasklist__tasks-list`)
      .appendChild(newTaskElement);
  };
  render() {
    const liElement = document.createElement('li');
    liElement.classList.add(
      'tasklists-list__item',
      'tasklist'
    );
    liElement.setAttribute('id', this.#BillboardID);
    liElement.addEventListener(
      'dragstart',
      () => localStorage.setItem('srcbillboardID', this.#BillboardID)
    );
    liElement.addEventListener('drop', this.onDropTaskInTasklist);

    const h2Element = document.createElement('h2');
    h2Element.classList.add('tasklist__name');
    h2Element.innerHTML = this.#BillboardAddres;
    liElement.appendChild(h2Element);

    const editBtn = document.createElement('button');
    editBtn.setAttribute('type', 'button');
    editBtn.classList.add('task__contol-btn', 'edit-icon');
    editBtn.addEventListener('click', () => {
      localStorage.setItem('editBillboardID', this.#BillboardID);
      document.getElementById('modal-edit-billboard').showModal();
    });
    liElement.appendChild(editBtn);

    const deleteBtn = document.createElement('button');
    deleteBtn.setAttribute('type', 'button');
    deleteBtn.classList.add('task__contol-btn', 'delete-icon');
    deleteBtn.addEventListener('click', () => {
      localStorage.setItem('deleteBillboardID', this.#BillboardID);

      const deleteTaskModal = document.getElementById('modal-delete-billboard');
      console.log(deleteTaskModal);
      deleteTaskModal.querySelector('.app-modal__question_billboard').innerHTML = `Биллборд '${this.#BillboardID}' будет удален. Прододлжить?`;
      deleteTaskModal.showModal();
    });
    liElement.appendChild(deleteBtn);

    

    const innerUlElement = document.createElement('ul');
    innerUlElement.classList.add('tasklist__tasks-list');
    liElement.appendChild(innerUlElement);

    const button = document.createElement('button');
    button.setAttribute('type', 'button');
    button.classList.add('tasklist__add-task-btn');
    button.innerHTML = '&#10010; Добавить заявку';
    button.addEventListener('click', () => {
      console.log("x2", this.#BillboardID)
      localStorage.setItem('addTaskTasklistID', this.#BillboardID);
      document.getElementById('modal-add-task').showModal();
    });
    liElement.appendChild(button);

    const adderElement = document.querySelector('.tasklist-adder');
    adderElement.parentElement.insertBefore(liElement, adderElement);
  }
};
