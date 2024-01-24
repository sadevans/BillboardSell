export default class Task {
  #taskID = '';
  #taskText = '';
  #taskDateStart = '';
  #taskDateEnd = '';
  #BillboardID = ''

  constructor({
    taskID = null,
    taskText,
    taskDateStart,
    taskDateEnd,
    BillboardID
  }) {
    this.#taskID = taskID || crypto.randomUUID();
    this.#taskDateStart = taskDateStart;
    this.#taskDateEnd = taskDateEnd;
    this.#taskText = taskText;
    this.#BillboardID = BillboardID;
  }

  get taskID() { return this.#taskID; }
  get taskDateStart() { return this.#taskDateStart; }
  get taskDateEnd() { return this.#taskDateEnd; }
  get BillboardID() { return this.#BillboardID; }

  get taskText() { return this.#taskText; }
  set BillboardID(value) {this.#BillboardID = value;}
  set taskText(value) {
    if (typeof value === 'string') {
      this.#taskText = value;
    }
  }

  render() {
    const liElement = document.createElement('ul');
    liElement.classList.add('tasklist__tasks-list-item', 'task');
    liElement.setAttribute('id', this.#taskID);
    liElement.setAttribute('draggable', true);
    liElement.addEventListener('dragstart', (evt) => {
      evt.target.classList.add('task_selected');
      localStorage.setItem('movedTaskID', this.#taskID);
    });
    liElement.addEventListener('dragend', (evt) => evt.target.classList.remove('task_selected'));

    const span = document.createElement('h1');
    span.classList.add('task__text1');
    span.innerHTML = `ФИО: ${this.#taskText}`;
    liElement.appendChild(span);

    const span_start = document.createElement('h1');
    span_start.classList.add('task__text2');
    span_start.innerHTML = `Начало аренды: ${this.#taskDateStart}`;
    liElement.appendChild(span_start);

    const span_end = document.createElement('h1');
    span_end.classList.add('task__text3');
    span_end.innerHTML = `Конец аренды: ${this.#taskDateEnd}`;
    liElement.appendChild(span_end);

    const controlsDiv = document.createElement('div');
    controlsDiv.classList.add('task__controls');

    const lowerRowDiv = document.createElement('div');
    lowerRowDiv.classList.add('task__controls-row');

    const editBtn = document.createElement('button');
    editBtn.setAttribute('type', 'button');
    editBtn.classList.add('task__contol-btn', 'edit-icon');
    editBtn.addEventListener('click', () => {
      localStorage.setItem('editTaskID', this.#taskID);
      localStorage.setItem('editTaskBillID', this.#BillboardID);
      console.log("this", this.#BillboardID);
      document.getElementById('modal-edit-task').showModal();
    });
    lowerRowDiv.appendChild(editBtn);

    const deleteBtn = document.createElement('button');
    deleteBtn.setAttribute('type', 'button');
    deleteBtn.classList.add('task__contol-btn', 'delete-icon');
    deleteBtn.addEventListener('click', () => {
      localStorage.setItem('deleteTaskID', this.#taskID);
      
      const deleteTaskModal = document.getElementById('modal-delete-task');
      deleteTaskModal.querySelector('.app-modal__question').innerHTML = `Заявка '${this.#taskText}' будет удалена. Прододлжить?`;
      deleteTaskModal.showModal();
    });
    lowerRowDiv.appendChild(deleteBtn);

    controlsDiv.appendChild(lowerRowDiv);

    liElement.appendChild(controlsDiv);

    return liElement;
  }
};
