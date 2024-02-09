import { v4 as uuidv4 } from 'uuid';

export type UserBody = {
  username: string;
  age: number;
  hobbies: string[];
};

export type User = UserBody & { id: string };

type DB = {
  add: (user: UserBody) => User;
  getAll: () => User[];
}

export class ServerDB implements DB {
  private _data: User[] = [];

  public add(user: UserBody) {
    const newUser = { ...user, id: uuidv4() }
    this._data.push(newUser);
    return newUser;
  }

  public getAll() {
    return this._data;
  }
}
