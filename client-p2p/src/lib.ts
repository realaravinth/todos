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

export const EVENT_NAME = "re-render-page";
export const RenderEvent = new Event(EVENT_NAME);

export type Task = {
  id: number;
  // true = task is pending
  // false = task is done
  pending: boolean;
  name: string;
};

export interface TaskStorage {
  addTask(name: string): Promise<Task>;
  getTasks(): Promise<Array<Task> | null>;
  markDone(id: number): Promise<void>;
  markPending(id: number): Promise<void>;
  restore(tasks: Array<Task>): Promise<void>;
}

export class App {
  storage: TaskStorage;
  app: HTMLElement;
  form: HTMLFormElement;
  task: HTMLInputElement;
  renderEvent: Event;

  constructor(storage: TaskStorage) {
    this.storage = storage;
    this.app = <HTMLElement>document.getElementById("app");
    this.form = <HTMLFormElement>document.getElementById("form");
    this.form.addEventListener(
      "submit",
      async (e: Event) => await this.addTask(e)
    );
    this.task = <HTMLInputElement>document.getElementById("task");
    this.renderEvent = document.createEvent('Event')
    document.body.addEventListener(EVENT_NAME, async () => await this.render())
    document.body.dispatchEvent(RenderEvent)
  }

  async addTask(e: Event) {
    e.preventDefault();
    const name = this.task.value;
    await this.storage.addTask(name);
    await this.render();
    this.task.value = "";
  }

  async render() {
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
            await this.storage.markDone(task.id);
            await this.render();
          });
        } else {
          pending.innerText = "Done";
          btn.innerText = "Mark Pending";
          btn.addEventListener("click", async (e: Event) => {
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
