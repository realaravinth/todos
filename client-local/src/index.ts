/* TODO demo
 * Copyright © 2021 Aravinth Manivannan <realaravinth@batsense.net>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
const APP = <HTMLDivElement>document.getElementById("app");
const FORM = <HTMLButtonElement>document.getElementById("form");

FORM.addEventListener("submit", (e: Event) => addTask(e));
const addTask = (e: Event) => e.preventDefault();

type Task = {
  id: number;
  pending: boolean;
  name: string;
};

interface TaskStorage {
  setTasks(name: string, pending: boolean): Task;
  getTasks(): Array<Task> | null;
}

class LocalStorage implements TaskStorage {
  ITEM = "todo_tasks";
  getTasks() {
    const tasksPersisted = localStorage.getItem(this.ITEM);
    if (tasksPersisted === null) {
      return null;
    } else {
      const tasks: Array<Task> = JSON.parse(tasksPersisted);
      return tasks;
    }
  }

  setTasks(name: string, pending: boolean) {
    const tasksPersisted = this.getTasks();
    let task;
    if (tasksPersisted === null) {
      task = {
        id: 0,
        pending,
        name,
      };
      localStorage.setItem(this.ITEM, JSON.stringify([task]));
    } else {
      task = {
        id: tasksPersisted.length,
        pending,
        name,
      };
      tasksPersisted.push(task);
      localStorage.setItem(this.ITEM, JSON.stringify([tasksPersisted]));
    }
    return task;
  }
}

class App {
  storage: TaskStorage;
  constructor(storage: TaskStorage) {
    this.storage = storage;
  }

  async render() {
    const container = document.createElement("div");
    container.className = "container";
    const tasksPersisted = this.storage.getTasks();
    if (tasksPersisted === null) {
      const emptyTaskList = document.createElement("p");
      emptyTaskList.innerText = "Looks like you don't have any tasks saved";
    } else {
      const table = document.createElement("table");

      const headContainer = document.createElement("thead");
      const taskStatus = document.createElement("th");
      taskStatus.innerText = "Status";
      const taskName = document.createElement("th");
      taskName.innerText = "Name";
      const taskAction = document.createElement("th");
      taskAction.innerText = "Action";

      const tBody = document.createElement("tbody");

      headContainer.appendChild(taskName);
      headContainer.appendChild(taskStatus);
      headContainer.appendChild(taskAction);
      table.appendChild(headContainer);
      table.appendChild(tBody);

      tasksPersisted.forEach((task) => {
        const row = document.createElement("tr");
        const name = document.createElement("td");
        name.innerText = task.name;
        const pending = document.createElement("td");
        const action = document.createElement("td");
        const btn = document.createElement("button");

        action.appendChild(btn);
        row.appendChild(name);
        row.appendChild(pending);
        row.appendChild(action);

        if (task.pending) {
          pending.innerText = "Pending";
          btn.innerText = "Mark Done";
          //TODO add event listener
        } else {
          pending.innerText = "Done";
          btn.innerText = "Mark Pending";
          //TODO add event listener
        }
        tBody.appendChild(row);
      });
    }

    Array.from(APP.children).forEach((element: any) => element.remove());
    APP.appendChild(container);
  }
}
