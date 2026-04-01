/*
 * useState is a "Hook" — a special function from React that lets your
 * component remember things between re-renders.  When you call a setter
 * like setTodos(...), React re-runs your component with the new value
 * and updates the screen automatically.
 */
import { useState } from 'react'
import './App.css'

/*
 * ── TodoItem component ─────────────────────────────────────────────
 *
 * "Props" (short for properties) are how a parent component passes data
 * down to a child.  Think of props like function arguments — they flow
 * one way: parent → child.  TodoItem never changes the data directly;
 * it calls handler functions that the parent (App) provided.
 */
function TodoItem({
  todo,
  isEditing,    // true when this todo is in edit mode
  editText,     // the current text inside the edit input
  setEditText,  // setter to update editText as user types
  onToggle,
  onDelete,
  onEditStart,
  onEditSave,
  onEditCancel,
}) {
  return (
    /*
     * We build the className string dynamically:
     * - "completed" adds strikethrough + faded styling
     * - "todo-exit" triggers the slide-out animation before removal
     * The fade-in animation is always applied via CSS on .todo-item.
     */
    <li
      className={
        `todo-item` +
        `${todo.completed ? ' completed' : ''}` +
        `${todo.deleting ? ' todo-exit' : ''}`
      }
    >
      <input
        type="checkbox"
        className="todo-checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
      />

      {/*
        * Conditional rendering: if this todo is being edited, show an
        * <input> field.  Otherwise show the text in a <span>.
        * This is a common React pattern — use a ternary (? :) to swap
        * what gets rendered based on some condition.
        */}
      {isEditing ? (
        /*
         * autoFocus automatically puts the cursor in this input when
         * it appears.  onKeyDown listens for specific key presses:
         * Enter to save, Escape to cancel.
         */
        <input
          type="text"
          className="todo-edit-input"
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onEditSave()
            if (e.key === 'Escape') onEditCancel()
          }}
          onBlur={onEditSave}
          autoFocus
        />
      ) : (
        /*
         * onDoubleClick fires when the user double-clicks.
         * We use it to enter edit mode for this todo.
         */
        <span className="todo-text" onDoubleClick={() => onEditStart(todo)}>
          {todo.text}
        </span>
      )}

      <button className="todo-delete" onClick={() => onDelete(todo.id)}>
        Delete
      </button>
    </li>
  )
}

/*
 * ── App component (the main / root component) ─────────────────────
 */
function App() {
  // ── State ────────────────────────────────────────────────────────
  // Each useState call stores one piece of data that can change over time.

  const [todos, setTodos] = useState([])       // the full list of todo objects
  const [text, setText] = useState('')          // what the user is typing in the "add" input

  /*
   * Filter state: which tab is active — 'all', 'active', or 'completed'.
   * We don't store separate filtered arrays.  Instead we "derive" the
   * visible list from the main todos array (see visibleTodos below).
   */
  const [filter, setFilter] = useState('all')

  // Search state: text the user types to search/filter todos by name
  const [search, setSearch] = useState('')

  // Edit state: which todo (by id) is being edited, and the text in the edit input
  const [editingId, setEditingId] = useState(null)
  const [editText, setEditText] = useState('')

  // ── Derived state ────────────────────────────────────────────────
  /*
   * "Derived state" means we compute a value from existing state instead
   * of storing it separately.  This is a best practice in React — it keeps
   * your data in one place (the `todos` array) and avoids bugs where
   * separate copies get out of sync.
   *
   * The filtering pipeline:
   * 1. First filter by tab (all / active / completed)
   * 2. Then filter by search text (case-insensitive match)
   *
   * Because both filters are chained, they work together automatically —
   * e.g., searching while on the "Active" tab only searches active todos.
   */
  const visibleTodos = todos
    .filter((todo) => {
      if (filter === 'active') return !todo.completed
      if (filter === 'completed') return todo.completed
      return true // 'all' — show everything
    })
    .filter((todo) =>
      todo.text.toLowerCase().includes(search.toLowerCase())
    )

  // Count items left (always from the full list, not the filtered view)
  const itemsLeft = todos.filter((todo) => !todo.completed).length
  const hasCompleted = todos.some((todo) => todo.completed)

  // ── Handler functions ────────────────────────────────────────────

  function handleAdd(e) {
    e.preventDefault()  // stop the browser from reloading the page
    if (text.trim() === '') return

    const newTodo = {
      id: Date.now(),
      text: text.trim(),
      completed: false,
      deleting: false,  // used for the exit animation
    }

    /*
     * Spread syntax (...) creates a NEW array — the new todo at the
     * front, followed by all existing todos.  In React, always create
     * new arrays/objects instead of mutating — that's how React detects changes.
     */
    setTodos([newTodo, ...todos])
    setText('')
  }

  function handleToggle(id) {
    // .map() builds a new array, flipping `completed` for the matching todo
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    )
  }

  /*
   * Delete with animation:
   * 1. First, mark the todo as "deleting" — this adds the .todo-exit CSS class
   *    which triggers a 300ms slide-out animation.
   * 2. After 300ms, actually remove it from state.
   *
   * setTimeout schedules code to run after a delay (in milliseconds).
   * We use the callback form of setTodos (prev => ...) inside setTimeout
   * so we always work with the latest state, not a stale snapshot.
   */
  function handleDelete(id) {
    // Step 1: mark as deleting (triggers CSS animation)
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, deleting: true } : todo
      )
    )

    // Step 2: remove after animation finishes
    setTimeout(() => {
      setTodos((prev) => prev.filter((todo) => todo.id !== id))
    }, 300)
  }

  // Remove all completed todos at once
  function handleClearCompleted() {
    // Mark all completed todos as deleting for the animation
    setTodos(
      todos.map((todo) =>
        todo.completed ? { ...todo, deleting: true } : todo
      )
    )

    // Remove them after the animation
    setTimeout(() => {
      setTodos((prev) => prev.filter((todo) => !todo.completed))
    }, 300)
  }

  // ── Edit handlers ──────────────────────────────────────────────

  function handleEditStart(todo) {
    setEditingId(todo.id)
    setEditText(todo.text)
  }

  function handleEditSave() {
    if (editText.trim() === '') {
      // If the user clears the text, cancel instead of saving empty
      handleEditCancel()
      return
    }

    setTodos(
      todos.map((todo) =>
        todo.id === editingId ? { ...todo, text: editText.trim() } : todo
      )
    )
    setEditingId(null)
    setEditText('')
  }

  function handleEditCancel() {
    setEditingId(null)
    setEditText('')
  }

  // ── JSX (the UI) ────────────────────────────────────────────────
  return (
    <div className="app">
      <h1 className="app-title">My To-Do List</h1>

      {/* ── Add form ── */}
      <form className="todo-form" onSubmit={handleAdd}>
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

      {/* ── Filter tabs ── */}
      <div className="filter-tabs">
        {['all', 'active', 'completed'].map((tab) => (
          <button
            key={tab}
            className={`filter-tab${filter === tab ? ' active' : ''}`}
            onClick={() => setFilter(tab)}
          >
            {/* Capitalize the first letter for display */}
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* ── Search bar ── */}
      <input
        type="text"
        className="search-input"
        placeholder="Search todos..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* ── Todo list ── */}
      <ul className="todo-list">
        {/*
          * .map() loops through visibleTodos (the filtered list) and
          * renders a <TodoItem> for each one.  The "key" prop helps React
          * track which items changed — always use a unique id.
          */}
        {visibleTodos.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            isEditing={editingId === todo.id}
            editText={editText}
            setEditText={setEditText}
            onToggle={handleToggle}
            onDelete={handleDelete}
            onEditStart={handleEditStart}
            onEditSave={handleEditSave}
            onEditCancel={handleEditCancel}
          />
        ))}
      </ul>

      {/* ── Empty state ── */}
      {visibleTodos.length === 0 && todos.length > 0 && (
        <p className="todo-empty">No matching todos</p>
      )}

      {/* ── Footer ── */}
      {todos.length > 0 && (
        <div className="todo-footer">
          <span>
            {itemsLeft} {itemsLeft === 1 ? 'item' : 'items'} left
          </span>

          {/*
            * Conditional rendering with &&:
            * The button only appears when hasCompleted is true.
            * React skips rendering when the left side of && is false.
            */}
          {hasCompleted && (
            <button
              className="clear-completed-btn"
              onClick={handleClearCompleted}
            >
              Clear completed
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default App
