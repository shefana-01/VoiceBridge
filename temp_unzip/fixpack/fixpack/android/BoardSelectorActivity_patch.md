# One-line change to BoardSelectorActivity.java

So a 4×4 board renders as 4 columns (not the old hardcoded 3), pass the
board's column count when launching MainActivity.

Find this block in `BoardSelectorActivity.java`:

```java
Intent intent = new Intent(this, MainActivity.class);
intent.putExtra("board_id", board.id);
intent.putExtra("board_name", board.name);
```

Add ONE line:

```java
Intent intent = new Intent(this, MainActivity.class);
intent.putExtra("board_id", board.id);
intent.putExtra("board_name", board.name);
intent.putExtra("board_cols", board.cols);   // <-- ADD THIS
```

That's it. `MainActivity` already reads `board_cols` (defaulting to 4 if
it's missing), so the app still works even if you forget this line — the
grid just won't perfectly match a non-4-wide board.
