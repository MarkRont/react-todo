/*
 * useState is a "Hook" — a special function from React that lets your
 * component remember things between re-renders.  When you call setTodos(...)
 * or setText(...), React re-renders the component with the new value.
 */
import { useState } from 'react'
import './App.css'

/*
 * ── TodoItem component ─────────────────────────────────────────────
 *
 * "Props" (short for properties) are how a parent component passes data
 * down to a child component.  Here, App passes each todo's data and
 * handler functions so TodoItem can display the todo and respond to
 * user actions without owning the data itself.
 *
 * Think of props like function arguments — they flow one way: parent → child.
 */
function TodoItem({ todo, onToggle, onDelete }) {
  return (
    // Apply the "completed" CSS class when the todo is done
    <li className={`todo-item ${todo.completed ? 'completed' : ''}`}>
      {/*
        * A "controlled" checkbox: its checked state comes from our data,
        * and onChange tells React what to do when the user clicks it.
        */}
      <input
        type="checkbox"
        className="todo-checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
      />

      <span className="todo-text">{todo.text}</span>

      <button
        className="todo-delete"
        onClick={() => onDelete(todo.id)}
      >
        Delete
      </button>
    </li>
  )
}

/*
 * ── App component (the main / root component) ─────────────────────
 */
function App() {
  /*
   * useState returns a pair: [currentValue, setterFunction].
   * - todos: the array of todo objects we're storing
   * - setTodos: the function we call to update that array
   * Every time we call setTodos, React re-renders the UI automatically.
   */
  const [todos, setTodos] = useState([])

  /*
   * This state holds whatever the user is currently typing in the input.
   * This pattern is called a "controlled input" — React controls the
   * value of the input field via state, so the UI always matches the data.
   */
  const [text, setText] = useState('')

  // ── Handler functions ──────────────────────────────────────────

  function handleAdd(e) {
    /*
     * Forms submit with a page reload by default.
     * preventDefault() stops that so our React app stays in control.
     */
    e.preventDefault()

    // Don't add empty todos
    if (text.trim() === '') return

    // Create a new todo object and add it to the front of the list
    const newTodo = {
      id: Date.now(),       // simple unique id using the current timestamp
      text: text.trim(),
      completed: false,
    }

    /*
     * We use the "spread" syntax (...) to create a new array that
     * contains the new todo followed by all existing todos.
     * In React, always create a NEW array/object instead of mutating
     * the old one — this is how React knows something changed.
     */
    setTodos([newTodo, ...todos])
    setText('')  // clear the input after adding
  }

  function handleToggle(id) {
    /*
     * .map() creates a new array where we flip the "completed" value
     * for the todo that matches the given id, and leave the rest unchanged.
     */
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    )
  }

  function handleDelete(id) {
    // .filter() creates a new array with only the todos that DON'T match the id
    setTodos(todos.filter((todo) => todo.id !== id))
  }

  // Count how many todos are not yet completed
  const itemsLeft = todos.filter((todo) => !todo.completed).length

  /*
   * ── JSX (what gets rendered to the screen) ───────────────────
   *
   * JSX looks like HTML but it's actually JavaScript.  React turns
   * this into real DOM elements.  A few differences from HTML:
   * - Use className instead of class
   * - Use {expression} to embed JavaScript values
   * - Event handlers are camelCase: onClick, onChange, onSubmit
   */
  return (
    <div className="app">
      <h1 className="app-title">My To-Do List</h1>

      {/* Form for adding new todos */}
      <form className="todo-form" onSubmit={handleAdd}>
        {/*
          * "Controlled input": the value always matches our `text` state,
          * and onChange updates the state every time the user types.
          */}
        <input
          type="text"
          className="todo-input"
          placeholder="What needs to be done?"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button type="submit" className="todo-add-btn">
          Add
        </button>
      </form>

      {/* Todo list */}
      <ul className="todo-list">
        {/*
          * .map() loops through the todos array and returns a <TodoItem>
          * for each one.  The "key" prop is required by React so it can
          * efficiently track which items changed, were added, or removed.
          * Always use a unique, stable value (like an id) as the key.
          */}
        {todos.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onToggle={handleToggle}
            onDelete={handleDelete}
          />
        ))}
      </ul>

      {/* Footer: only shows when there are todos */}
      {todos.length > 0 && (
        <p className="todo-footer">
          {itemsLeft} {itemsLeft === 1 ? 'item' : 'items'} left
        </p>
      )}
    </div>
  )
}

/*
 * "export default" makes this component available to other files.
 * main.jsx imports App and renders it into the page.
 */
export default App
