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
import { ThreadID, Where } from "@textile/hub";
import AppIdentity from "./identity";
import { Task, TaskStorage, App } from "./lib";

class TaskThread implements TaskStorage {
  //implements TaskStorage {
  THREAD_ITEM = "tasks_thread_id";
  thread_collection_name = "todo-tasks-v2";
  thread_id = "tasks-thread-v1";
  _initLock = false;

  threadID: ThreadID | null = null;
  id: AppIdentity;

  constructor(id: AppIdentity) {
    this.id = id;
    this.init();
  }

  init = async () => {
    if (this._initLock) return;
    this._initLock = true;
    let threadIDPersisted = localStorage.getItem(this.THREAD_ITEM);
    if (threadIDPersisted === null) {
      const client = await this.id.getClient();
      const tasks = {
        title: "Tasks_v3",
        type: "object",
        required: ["id", "name", "pending"],
        properties: {
          name: {
            type: "string",
            description: "The task name.",
          },
          pending: {
            description: "Is the task pending",
            type: "boolean",
          },
          id: {
            description: "ID of the task",
            type: "integer",
            minimum: 0,
          },
          _id: {
            description: "ID of instance",
            type: "string",
          },
        },
      };

      const _create_thread = async () => {
        let threadId = await client.newDB(undefined, this.thread_id);
        localStorage.removeItem(this.THREAD_ITEM);
        localStorage.setItem(this.THREAD_ITEM, threadId.toString());
        this.threadID = threadId;

        await client.newCollection(this.threadID, {
          name: this.thread_collection_name,
          schema: tasks,
        });
      };
      const _run = async () => {
        await _create_thread();
      };

      _run();
    } else {
      this.threadID = ThreadID.fromString(threadIDPersisted);
    }

    this._initLock = false;
  };

  async restore(tasks: Array<Task>) {
    await this.init();
    if (this.threadID === null) return;
    const client = await this.id.getClient();
    await client.save(this.threadID, this.thread_collection_name, tasks);
  }

  async markDone(id: number) {
    await this.init();
    if (this.threadID === null) return;

    const client = await this.id.getClient();
    const query = new Where("id").eq(id);

    const result = await client.find<Task>(
      this.threadID,
      this.thread_collection_name,
      query
    );

    if (result.length < 1) return;

    const task = result[0];
    if (task.pending) {
      task.pending = false;
      return await client.save(this.threadID, this.thread_collection_name, [
        task,
      ]);
    }
  }

  async markPending(id: number) {
    await this.init();
    if (this.threadID === null) return;

    const client = await this.id.getClient();
    const query = new Where("id").eq(id);

    const result = await client.find<Task>(
      this.threadID,
      this.thread_collection_name,
      query
    );

    if (result.length < 1) return;

    const task = result[0];
    if (!task.pending) {
      task.pending = true;
      return await client.save(this.threadID, this.thread_collection_name, [
        task,
      ]);
    }
  }

  async run() {
    await this.init();
    if (this.threadID === null) return;

    const client = await this.id.getClient();
    const query = new Where("id").gt(-1);

    const res = await client.find<Task>(
      this.threadID,
      this.thread_collection_name,
      query
    );
    console.log(res);
  }

  async addTask(name: string) {
    await this.init();

    const pending = true;
    const client = await this.id.getClient();
    const result = await client.find<Task>(
      <ThreadID>this.threadID,
      this.thread_collection_name,
      {}
    );

    console.log(result);

    let task: Task = {
      id: 0,
      pending,
      name,
    };

    if (result.length < 1) {
      await client.create(
        <ThreadID>this.threadID,
        this.thread_collection_name,
        [task]
      );
    } else {
      task.id = result.length;
    }
    await client.create(<ThreadID>this.threadID, this.thread_collection_name, [
      task,
    ]);
    return task;
  }

  async getTasks() {
    await this.init();
    const client = await this.id.getClient();
    const result = await client.find<Task>(
      <ThreadID>this.threadID,
      this.thread_collection_name,
      {}
    );

    if (result.length == 0) {
      return null;
    } else {
      return result;
    }
  }
}

const run = async () => {
  const id = new AppIdentity();
  const thread = new TaskThread(id);
  new App(thread);
};

run();
