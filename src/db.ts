import { v4 as uuidv4 } from 'uuid';

export type UserBody = {
  username: string;
  age: number;
  hobbies: string[];
};

export type User = UserBody & { id: string };

export type DB = {
  post: (user: UserBody) => User;
  getAll: () => User[];
  get: (userId: string) => User | null;
  put: (user: User) => User | null;
}

export class ServerDB implements DB {
  private _data: User[] = [];

  public post(user: UserBody): User {
    const newUser = { ...user, id: uuidv4() }
    this._data.push(newUser);
    return newUser;
  }

  public put(user: User): User | null {
    const existingUser = this._data.find(({ id }) => id === user.id);
    if(!existingUser) return null;
    existingUser.username = user.username;
    existingUser.age = user.age
    existingUser.hobbies = user.hobbies;
    return existingUser;
  }

  public getAll(): User[] {
    return this._data;
  }

  public get(userId: string): User | null {
    const user = this._data.find(({ id }) => id === userId);
    return user ?? null;
  }
}
