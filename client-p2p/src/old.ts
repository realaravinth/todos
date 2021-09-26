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
