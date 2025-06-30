# RWSTable Component

A flexible, RWS-style table component for use in your applications. Supports dynamic columns, actions, cell slot overrides for custom rendering, and per-row action filtering (e.g. for ACL).

## Features
- Dynamic columns and data
- Action buttons per row
- Bootstrap-compatible styling via `displayClass`
- Slot support for custom cell rendering
- **Per-row action filtering** via `actionFilter` (e.g. for ACL)

## Basic Usage
```html
<rws-table
  :columns="${columns}"
  :data="${data}"
  :fields="${fields}"
  :actions="${actions}"
  emptyLabel="No records found">
</rws-table>
```

## Custom Cell Rendering
Override the content of a specific cell by providing a slot named `cell-<key>`:

```html
<rws-table ...>
  <span slot="cell-username" slot-scope="{ row }">
    <strong>{{ row.username }}</strong>
  </span>
</rws-table>
```
- The slot name must match the column key (e.g., `cell-username` for the `username` column).
- The default cell content will be used if no slot is provided.

## Action Filtering (ACL, etc.)
You can provide an `actionFilter` function to control which actions are shown for each row. For example, to use an ACL function:

```js
const actionFilter = (action, row) => acl(action.key, row);
```

```html
<rws-table
  :columns="${columns}"
  :data="${data}"
  :fields="${fields}"
  :actions="${actions}"
  :actionFilter="${actionFilter}"
  emptyLabel="No records found">
</rws-table>
```
- The filter receives the action and the row, and should return `true` to show the action, `false` to hide it.
- If not set, all actions are shown.

## Props
- `columns`: Array of column definitions `{ key, header, formatter? }`
- `data`: Array of row objects
- `fields`: Array of column keys to display (order matters)
- `actions`: Array of action button definitions `{ key, label, variant, handler }`
- `actionFilter`: Optional function `(action, row) => boolean` to filter actions per row
- `emptyLabel`: Message to show when no data

## Styling
All table elements use the `displayClass` method for consistent Bootstrap-based styling. You can customize these classes in the `DisplayManager`.

## Example
```js
const columns = [
  { key: 'name', header: 'Name' },
  { key: 'username', header: 'Username' },
  { key: 'email', header: 'Email' }
];
const data = [
  { id: 1, name: 'Alice', username: 'alice', email: 'alice@example.com' },
  { id: 2, name: 'Bob', username: 'bob', email: 'bob@example.com' }
];
const fields = ['name', 'username', 'email'];
const actions = [
  { key: 'edit', label: 'Edit', variant: 'info', handler: (id) => editUser(id) },
  { key: 'delete', label: 'Delete', variant: 'danger', handler: (id) => deleteUser(id) }
];
const actionFilter = (action, row) => acl(action.key, row);
```

## License
MIT
