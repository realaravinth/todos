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
import { TaskStorage, Task, App } from "./lib";

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
        if (!task.pending) {
          tasks[id].pending = true;
          localStorage.removeItem(this.ITEM);
          localStorage.setItem(this.ITEM, JSON.stringify(tasks));
        }
      }
    }
  }
}
new App(new LocalStorage());
