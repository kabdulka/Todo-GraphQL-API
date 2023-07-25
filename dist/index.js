import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
// const uuid = require('uuid');
import { v4 as uuidv4 } from 'uuid';
// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
const typeDefs = `#graphql
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.

  # This "Todo" type defines the queryable fields for every Todo in our data source.
  type Todo {
    id: String
    task: String
    completed: Boolean
  }

  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  # case, the "todos" query returns an array of zero or more todos (defined above).
  type Query {
    todos: [Todo!]!
    getActiveTodos: [Todo!]!
  }

  type Mutation {
      addTodo(task: String!, completed: Boolean!): Todo!
      updateTodo(id: String): String
      deleteTodo(id: String): Todo
  }

`;
let todos = [
    {
        id: uuidv4(),
        task: 'Wake up early',
        completed: false,
    },
    {
        id: uuidv4(),
        task: 'Brush teeth',
        completed: false,
    },
    {
        id: uuidv4(),
        task: 'Eat Break fast',
        completed: false,
    },
];
// Resolvers define how to fetch the types defined in your schema.
// This resolver retrieves Todos from the "todos" array above.
const resolvers = {
    Query: {
        todos: () => todos,
        getActiveTodos: () => {
            const activeTodos = [];
            todos.forEach((todo) => {
                if (todo.completed === true) {
                    activeTodos.push(todo);
                }
            });
            return activeTodos;
        },
    },
    Mutation: {
        addTodo: (root, args) => {
            const { task, completed } = args;
            // make sure args are not empty
            if (task == undefined || completed == undefined) {
                return;
            }
            const newTodo = {
                id: uuidv4(),
                task: task,
                completed: completed
            };
            todos.push(newTodo);
            // console.log(newTodo)
            return newTodo;
        },
        // Function will mark a todo item as complete
        updateTodo: (root, args) => {
            let success = "Unable to find Item";
            todos.forEach((todo, index) => {
                if (todo.id === args.id) {
                    todo.completed = true;
                    success = "Successfully marked item as completed";
                    return;
                }
            });
            return success;
        },
        deleteTodo: (root, args) => {
            const { id } = args;
            console.log(id);
            // todo object to be deleted
            const targetTodo = todos.find(todo => todo.id === id);
            // make sure todo to be deleted exists
            if (targetTodo) {
                // "remove target todo from main source of data (todos arr)"
                console.log(targetTodo);
                const filteredTodos = todos.filter(todo => todo.id === id);
                todos = filteredTodos;
            }
            return targetTodo;
        }
    } // end Mutations
};
// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const server = new ApolloServer({
    typeDefs,
    resolvers,
});
// Passing an ApolloServer instance to the `startStandaloneServer` function:
//  1. creates an Express app
//  2. installs your ApolloServer instance as middleware
//  3. prepares your app to handle incoming requests
const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
});
console.log(`🚀  Server ready at: ${url}`);
