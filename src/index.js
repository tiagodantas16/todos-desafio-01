const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(user => user.username === username);

  if(!user){
    return response.status(400).json({ error: 'User already exists' });
  }

  request.user = user;

  return next();

}

app.post('/users', (request, response) => {
  const { name, username } = request.body;
  const usernameAlreadyExists = users.some(user => user.username === username);

  if(usernameAlreadyExists) {
    return response.status(400).json({ error: 'Username already exists' });
  }

  const user = { 
    id: uuidv4(),
    name, 
    username,
    todos: []
  };
  
  users.push(user);

  return response.status(201).json(users);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  
  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, done, deadLine } = request.body;

  const newTodos = {
    id: uuidv4(),
    title,
    done: false,
    deadLine: new Date(deadLine),
    created_at: new Date()
  };

  user.todos.push(newTodos);
  
  return response.status(201).json(newTodos);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;  
  const { title, deadLine } = request.body;
  const { id } = request.params;

  const todosExist = user.todos.find((todo) => todo.id === id);

  if(!todosExist) {
    return response.status(400).json({ error: 'todos does not exist'});
  }

  todosExist.title = title;
  todosExist.deadLine = new Date(deadLine);
  
  return response.status(201).json(todosExist);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todosExist = user.todos.find((todo) => todo.id === id);

  if(!todosExist) {
    return response.status(400).json({ error: 'todos does not exist'});
  }

  todosExist.done = true;

  return response.json(todosExist);

});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todosExist = user.todos.find((todo) => todo.id === id);

  if( todosExist === -1 ) {
    return response.status(400).json({ error: 'todos does not exist'});
  }

  user.todos.splice(todosExist, 1)

  return response.status(204).send();

});

module.exports = app;