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
import {
  PrivateKey,
  PublicKey,
  Client,
  Identity,
  KeyInfo,
  ThreadID,
} from "@textile/hub";

class AppIdentity {
  private_key: PrivateKey;
  public_key: PublicKey;
  PRIVATE_KEY_ITEM = "identity_user_private_key";
  PUBLIC_KEY_ITEM = "identity_user_public_key";
  keyinfo: KeyInfo = {
    key: "ba5aljb52vo74a3rtgwigb57e24",
  };

  client: Client | null = null;
  token: string | null = null;

  constructor() {
    let private_key = localStorage.getItem(this.PRIVATE_KEY_ITEM);
    if (private_key === null) {
      let new_private_key = PrivateKey.fromRandom();
      localStorage.removeItem(this.PRIVATE_KEY_ITEM);
      localStorage.setItem(this.PRIVATE_KEY_ITEM, new_private_key.toString());
      this.private_key = new_private_key;
    } else {
      this.private_key = PrivateKey.fromString(private_key);
    }

    this.public_key = this.private_key.public;
    localStorage.removeItem(this.PUBLIC_KEY_ITEM);
    localStorage.setItem(this.PUBLIC_KEY_ITEM, this.public_key.toString());
    console.log(this.public_key.toString());
    this.authorize().then((client) => {
      console.log(client);
    });
  }

  async authorize() {
    const client = await Client.withKeyInfo(this.keyinfo);
    const token = await client.getToken(this.private_key);
    this.client = client;
    this.token = token;
    return client;
  }

  getClient() {
    return <Client>this.client;
  }

  getKey() {
    return this.private_key;
  }

  async sign(data: Uint8Array) {
    return await this.private_key.sign(data);
  }

  async verify(data: Uint8Array, sig: Uint8Array) {
    return await this.public_key.verify(data, sig);
  }
}

const id = new AppIdentity();

let enc = new TextEncoder();
let buf = new Uint8Array(enc.encode("foo"));

const sigVerify = async () => {
  const sig = await id.sign(buf);
  console.log(sig);
  const res = id.verify(buf, sig);
  console.log(res);
};

class TaskThread {
  THREAD_ITEM = "tasks_thread_id";
  thread_collection_name = "todo_tasks";

  threadID: ThreadID | null = null;
  id: AppIdentity;

  constructor(id: AppIdentity) {
    this.id = id;
    this.init();
  }

  init = async () => {
    let threadIDPersisted = localStorage.getItem(this.THREAD_ITEM);
    if (threadIDPersisted === null) {
      const tasks = {
        title: "Tasks",
        type: "object",
        required: ["_id"],
        properties: {
          _id: {
            type: "string",
            description: "The instance's id.",
          },
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
        },
      };

      const client = this.id.getClient();

      const _create_thread = async () => {
        let threadId = await client.newDB(undefined, "foo");
        localStorage.removeItem(this.THREAD_ITEM);
        localStorage.setItem(this.THREAD_ITEM, threadId.toString());
        this.threadID = threadId;

        await client.updateCollection(this.threadID, {
          name: this.thread_collection_name,
          schema: tasks,
        });
      };
      const _run = async () => {
        await this.id.authorize();
        await _create_thread();
      };

      _run();
    } else {
      this.threadID = ThreadID.fromString(threadIDPersisted);
    }
  };
}
