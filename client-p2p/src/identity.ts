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
import { PrivateKey, PublicKey, Client, KeyInfo } from "@textile/hub";

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
    console.log(`public key: ${this.public_key.toString()}`);
    this.authorize();
  }

  async authorize() {
    if (this.client === null || this.token === null) {
      const client = await Client.withKeyInfo(this.keyinfo);
      const token = await client.getToken(this.private_key);
      this.client = client;
      this.token = token;
    }
    return this.client;
  }

  async getClient() {
    await this.authorize();
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

export default AppIdentity;
