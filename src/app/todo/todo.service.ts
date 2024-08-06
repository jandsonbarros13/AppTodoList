import { Injectable } from '@angular/core';
import PouchDB from 'pouchdb';
import { Todo } from './todo';

@Injectable({
  providedIn: 'root',
})
export class TodoService {
  localDB: any;
  todos: Todo[] = [];

  constructor() {}

  initDB() {
    this.localDB = new PouchDB('todo');

    const remoteDB = new PouchDB(
      'https://database-production-7e04.up.railway.app/todo',
      {
        fetch: (url: string | Request, opts: any) => {
          const login = "admin";
          const password = "rmnyNpXIJNNj";
          const token = btoa(login + ':' + password);
          opts.headers.set('Authorization', 'Basic ' + token);
          return PouchDB.fetch(url, opts);
        }
      }
    );

    this.localDB.sync(remoteDB, {
      live: true,
      retry: false,
    });

    this.localDB
      .changes({ live: true, since: 'now', include_docs: true })
      .on('change', this.onDatabaseChange);
  }

  private findIndex(id: string) {
    return this.todos.findIndex((todo) => todo._id === id);
  }

  private onDatabaseChange = (change: any) => {
    const index = this.findIndex(change.id);
    const todo = this.todos[index];

    if (change.deleted) {
      if (todo) {
        this.todos.splice(index, 1);
      }
    } else {
      if (todo && todo._id === change.id) {
        this.todos[index] = change.doc;
      } else {
        this.todos.splice(index, 0, change.doc);
      }
    }
  };

  getAll() {
    if (!this.todos.length) {
      return this.localDB
        .allDocs({ include_docs: true })
        .then((docs: { rows: any[] }) => {
          this.todos = docs.rows.map((row: { doc: any }) => row.doc);
          return this.todos;
        });
    } else {
      return Promise.resolve(this.todos);
    }
  }

  save(todo: Todo) {
    return this.localDB.post(todo);
  }

  update(todo: Todo) {
    return this.localDB.put(todo);
  }

  remove(todo: Todo) {
    return this.localDB.remove(todo);
  }
}
