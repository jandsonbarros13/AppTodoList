import { Component, OnInit } from '@angular/core';
import { Todo } from './todo';
import { TodoService } from './todo.service';

@Component({
  selector: 'app-todo',
  templateUrl: './todo.page.html',
  styleUrls: ['./todo.page.scss'],
})
export class TodoPage implements OnInit {
  todos: Todo[];
  todo: Todo;
  isTodoFormOpen: boolean = false;

  constructor(private todoService: TodoService) {}

  ngOnInit() {
    this.todoService.initDB();
    this.loadTodos();
  }

  loadTodos() {
    this.todoService
      .getAll()
      .then((todos: Todo[]) => {
        this.todos = todos;
      })
      .catch((err: any) => {
        console.log(err);
      });
  }

  onSaveTodo() {
    if (!this.todo._id) {
      this.todoService
        .save(this.todo)
        .then(() => {
          this.loadTodos();
          this.isTodoFormOpen = false;
        })
        .catch((err: any) => {
          console.log(err);
        });
    } else {
      this.todoService
        .update(this.todo)
        .then(() => {
          this.loadTodos();
          this.isTodoFormOpen = false;
        })
        .catch((err: any) => {
          console.log(err);
        });
    }
  }

  onOpenTodoForm() {
    this.todo = {
      _id: '',
      name: ''
    };
    this.isTodoFormOpen = true;
  }

  onEditItem(todo: Todo){
    this.todo = todo;
    this.isTodoFormOpen = true;
  }

  onRemoveItem() {
    this.todoService.remove(this.todo)
      .then(() => {
        this.loadTodos();
        this.isTodoFormOpen = false;
      })
      .catch((err: any) => {
        console.log(err);
      });
  }
}
