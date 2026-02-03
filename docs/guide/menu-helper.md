# Menu Helper

The `menu()` function provides an easy way to render interactive menus with selection highlighting, indicators, borders, and titles.

## Basic Usage

```typescript
renderer.menu(10, 5, ["New Game", "Load Game", "Options", "Quit"], {
  selected: 0,
  border: true,
  title: "Main Menu",
});
```

## API

### `menu(x, y, items, options?): this`

Draw a menu with selectable items.

**Parameters:**

- `x` - Starting X coordinate
- `y` - Starting Y coordinate
- `items` - Array of menu item strings
- `options` - Optional styling and behavior

**Options:**

- `selected?: number` - Index of selected item (highlights with different colors)
- `fg?: Color` - Foreground color for unselected items
- `bg?: Color` - Background color for unselected items
- `selectedFg?: Color` - Foreground color for selected item (default: `'black'`)
- `selectedBg?: Color` - Background color for selected item (default: `'white'`)
- `indicator?: string` - Selection indicator like `'>'` or `'•'`
- `border?: boolean` - Draw a box border around the menu
- `style?: BoxStyle` - Border style (`'single'`, `'double'`, `'rounded'`, `'heavy'`, `'ascii'`)
- `title?: string` - Title displayed in top border (requires `border: true`)
- `width?: number` - Fixed width (auto-calculated if omitted, centers items)
- `padding?: number` - Padding inside menu (default: 1)

## Examples

### Simple Menu

```typescript
renderer.menu(10, 5, ["Start Game", "Settings", "Exit"]);
```

### Menu with Selection

```typescript
let selection = 0;

renderer.menu(20, 10, ["Easy", "Medium", "Hard"], {
  selected: selection,
  indicator: ">",
});
```

### Styled Menu with Border

```typescript
renderer.menu(15, 8, ["New", "Open", "Save", "Quit"], {
  selected: 2,
  border: true,
  style: "double",
  title: "File Menu",
  fg: "cyan",
  selectedFg: "yellow",
  selectedBg: "blue",
});
```

### Centered Menu with Custom Width

```typescript
renderer.menu(10, 5, ["Yes", "No"], {
  width: 30,
  selected: 0,
  border: true,
});
```

## Interactive Menu Pattern

```typescript
const items = ["New Game", "Load Game", "Options", "Quit"];
let selected = 0;

function render() {
  renderer
    .clear()
    .menu(25, 10, items, {
      selected,
      border: true,
      title: "Main Menu",
      indicator: ">",
      style: "rounded",
    })
    .render();
}

// Handle keyboard input (pseudo-code)
on("keydown", (key) => {
  if (key === "ArrowDown") {
    selected = (selected + 1) % items.length;
  } else if (key === "ArrowUp") {
    selected = (selected - 1 + items.length) % items.length;
  } else if (key === "Enter") {
    handleSelection(selected);
  }
  render();
});
```

## Tips

- **Auto-sizing**: Menu width auto-calculates to fit the longest item + padding + border
- **Centering**: Use `width` option to center items in a fixed-width menu
- **Indicators**: Position automatically adjusts based on padding
- **Empty menus**: Gracefully handles empty `items` array
- **Chaining**: Returns renderer for method chaining

---

**Next:** [Progress Bar](./progress-bar.md) | **Prev:** [Layer System](./layer-system.md)
