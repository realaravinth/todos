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
type Task = {
  id: number;
  // true = task is pending
  // false = task is done
  pending: boolean;
  name: string;
};

interface TaskStorage {
  addTask(name: string): Promise<Task>;
  getTasks(): Promise<Array<Task> | null>;
  markDone(id: number): Promise<void>;
  markPending(id: number): Promise<void>;
  restore(tasks: Array<Task>): Promise<void>;
}

class LocalStorage implements TaskStorage {
  ITEM = "todo_tasks";
  async getTasks() {
    const tasksPersisted = localStorage.getItem(this.ITEM);
    if (tasksPersisted === null) {
      return null;
    } else {
      const tasks: Array<Task> = JSON.parse(tasksPersisted);
      return tasks;
    }
  }

  async restore(tasks: Array<Task>) {
    localStorage.removeItem(this.ITEM);
    localStorage.setItem(this.ITEM, JSON.stringify(tasks));
  }

  async addTask(name: string) {
    const pending = true;
    const tasksPersisted = await this.getTasks();
    let task;
    if (tasksPersisted === null) {
      task = {
        id: 0,
        pending,
        name,
      };
      localStorage.removeItem(this.ITEM);
      localStorage.setItem(this.ITEM, JSON.stringify([task]));
    } else {
      task = {
        id: tasksPersisted.length,
        pending,
        name,
      };
      tasksPersisted.push(task);
      localStorage.removeItem(this.ITEM);
      localStorage.setItem(this.ITEM, JSON.stringify(tasksPersisted));
    }
    return task;
  }

  async markDone(id: number) {
    const tasks = await this.getTasks();
    if (tasks === null) {
      return;
    } else {
      if (tasks.length < id) {
        return;
      } else {
        const task = tasks[id];
        console.log(task.pending);
        if (task.pending) {
          tasks[id].pending = false;
          localStorage.removeItem(this.ITEM);
          localStorage.setItem(this.ITEM, JSON.stringify(tasks));
        }
      }
    }
  }

  async markPending(id: number) {
    const tasks = await this.getTasks();
    if (tasks === null) {
      return;
    } else {
      if (tasks.length < id) {
        return;
      } else {
        const task = tasks[id];
        console.log(task.pending);
        if (!task.pending) {
          tasks[id].pending = true;
          localStorage.removeItem(this.ITEM);
          localStorage.setItem(this.ITEM, JSON.stringify(tasks));
        }
      }
    }
  }
}

class App {
  storage: TaskStorage;
  app: HTMLElement;
  form: HTMLFormElement;
  task: HTMLInputElement;
  exportBtn: HTMLButtonElement;
  importBtn: HTMLButtonElement;
  importFile: HTMLInputElement;

  constructor(storage: TaskStorage) {
    this.storage = storage;
    this.app = <HTMLElement>document.getElementById("app");
    this.form = <HTMLFormElement>document.getElementById("form");
    this.form.addEventListener(
      "submit",
      async (e: Event) => await this.addTask(e)
    );
    this.importFile = <HTMLInputElement>document.getElementById("file");
    this.task = <HTMLInputElement>document.getElementById("task");
    this.exportBtn = <HTMLButtonElement>document.getElementById("export");
    this.importBtn = <HTMLButtonElement>document.getElementById("import");
    this.importBtn.addEventListener(
      "click",
      async (e: Event) => await this.importTasks(e)
    );

    this.exportBtn.addEventListener(
      "click",
      async (e: Event) => await this.exportTasks(e)
    );
    this.render();
  }

  async addTask(e: Event) {
    e.preventDefault();
    const name = this.task.value;
    await this.storage.addTask(name);
    await this.render();
    this.task.value = "";
  }

  async exportTasks(e: Event) {
    e.preventDefault();
    const tasks = await this.storage.getTasks();
    if (tasks === null) {
      alert("No items to export");
    } else {
      const data = JSON.stringify(tasks, undefined, 2);
      const a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([data], { type: "text/json" }));
      a.download = "tasks.json";
      a.click();
    }
  }

  async importTasks(e: Event) {
    e.preventDefault();
    const files = <FileList>this.importFile.files;
    const file = files[0];
    const reader = new FileReader();
    reader.readAsText(file, "UTF-8");
    const app: App = this;
    reader.onload = async function (evt) {
      const contents = <string>evt.target?.result;
      const tasks: Array<Task> = JSON.parse(contents);
      await app.storage.restore(tasks);
      await app.render();
    };
    reader.onerror = function (_evt) {
      alert("error reading file");
    };
  }

  async render() {
    console.log("rendering");
    const container = document.createElement("div");
    container.className = "container";

    const tasksPersisted = await this.storage.getTasks();
    if (tasksPersisted === null) {
      const emptyTaskList = document.createElement("p");
      emptyTaskList.innerText = "Looks like you don't have any tasks saved";
      container.appendChild(emptyTaskList);
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
      container.appendChild(table);

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
          btn.addEventListener("click", async (e: Event) => {
            e.preventDefault();
            console.log("marking task as done");
            await this.storage.markDone(task.id);
            await this.render();
          });
        } else {
          pending.innerText = "Done";
          btn.innerText = "Mark Pending";
          btn.addEventListener("click", async (e: Event) => {
            console.log("marking task as pending");
            e.preventDefault();
            await this.storage.markPending(task.id);
            await this.render();
          });
          //TODO add event listener
        }
        tBody.appendChild(row);
      });
    }

    Array.from(this.app.children).forEach((element: any) => element.remove());
    this.app.appendChild(container);
  }
}

const app = new App(new LocalStorage());
