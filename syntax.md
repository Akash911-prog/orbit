# Orbit Syntax

## 1. Variables & Type Annotation

Orbit uses explicit type annotations introduced by a colon (`:`), indicating *"this is of type"*. Variable bindings are declared using the `let` keyword.

```orbit
// Variable declaration with explicit type annotation
let x: int = 5
let message: str = "Hello, Orbit!"
let is_active: bool = true
```

---

## 2. Functions (`fn`)

Functions are introduced with the `fn` keyword. Return types are specified after the parameter list using a colon (`:`). This maintains a uniform visual meaning for `:` across variables and function signatures, avoiding conflicts with other shorthand operators.

```orbit
// A standard function returning a string
fn greet(name: str): str {
    return "hello " + name
}

// A void function or function returning nothing (omitting the colon and type)
fn log_message(msg: str) {
    // implicit void/unit return
}

```

---

## 3. Control Flow (`if / else`)

Control flow in Orbit follows standard, highly readable systems programming conventions with mandatory block braces and no parentheses around conditions.

```orbit
if x > 0 {
    // executed if x is positive
} else if x == 0 {
    // executed if x is exactly zero
} else {
    // executed if x is negative
}

```

---

## 4. Pattern Matching (`match`)

Orbit implements a robust pattern matching syntax. It uses the `=>` operator for match arms to signify *"this condition produces this result"*. This clearly distinguishes production (`=>`) from type annotation (`:`). The underscore (`_`) acts as the fallback wildcard.

```orbit
match x {
    0 => "zero",
    1 => "one",
    _ => "other"
}

```

---

## 5. Ranges

Ranges utilize a clean, token-based system to delineate spans of values. This ensures complete compatibility with compiler tokenization without arithmetic or symbol conflicts.

```orbit
// Exclusive Range: contains values from 0 up to, but not including, 10 (0 to 9)
0..10

// Inclusive Range: contains values from 0 up to and including 10 (0 to 10)
0..=10

```

---

## 6. The Execution Lifecycle Quad (`orbit`, `drift`, `decay`, `nova` + `fire`)

Unlike standard syntactic sugar, Orbit's execution primitives represent concrete under-the-hood structural changes to the stack frame, ownership state, and execution context.

### A. The Orbit Primitive (`orbit`)

Introduces a scoped isolation block. An `orbit` establishes an explicit tracking boundary on the stack frame.

```orbit
orbit request {
    // block execution
}

```

* **Compiler Behavior:** Creates a "responsibility record" on the stack, tracking every resource or value owned by this scope. No resource can be implicitly dropped while an active transit is in progress.

### B. The Drift Primitive (`drift`)

Handles the explicit atomic transfer of ownership between two isolated orbits. It marks a formal type-state transit rather than a shallow copy or a standard pointer move.

```orbit
drift file -> request

```

* **Compiler Behavior:** Marks the value as `DRIFTING` in the compiler type-state engine. The source orbit atomically loses ownership (making further reads/writes a compile-time error). The value remains in an unreadable/unwritable transit isolation state until the destination orbit absorbs ownership.

### C. The Decay Primitive (`decay`)

Orbit's guaranteed resource cleanup engine. `decay` blocks are explicitly tied to their enclosing `orbit` scope.

```orbit
orbit processing_context {
    let connection = open_stream()
    
    decay {
        connection.close()
    }
}

```

* **Compiler Behavior:** Registers a guaranteed exit handler on the stack frame. Decay blocks execute systematically in reverse order of declaration (inner to outer) and are unconditionally executed—even if an asynchronous failure/panic occurs mid-orbit.

### D. Async Event Handlers (`nova` + `fire`)

Decouples execution using an optimized internal event queue system instead of a classic synchronous function call stack.

```orbit
// Defining an event consumer/handler
nova on_upload receives(file: File) {
    // async execution context
}

// Dispatched from elsewhere
fire on_upload(file)

```

* **Compiler Behavior:** `nova` registers the target logic block into a runtime event table. `fire` posts the event payload to an asynchronous event queue and returns control instantly. The caller context never blocks, expects no return value, and executes on a completely disconnected stack frame.

---

## 7. Shared Drift & Lifecycle Inheritance Rules

Orbit guarantees absolute thread and memory safety without a tracing garbage collector or explicit lifetimes by implementing reactive runtime-aware type-state shifts when lifecycles intersect.

### Rule 1: The Survivor Transfer Rule

> **If a shared drift exists between two orbits and one orbit decays, full ownership automatically transfers to the surviving orbit.**

```orbit
orbit primary {
    let resource = OpenResource()
    
    orbit secondary {
        // Creates a shared drift context for 'resource'
        drift resource -> secondary 
        
        // When secondary exits and decays here, 
        // full ownership safely snaps back to 'primary'
    } 
    
    // 'resource' remains fully safe and valid to use here
}

```

### Rule 2: The Nova Asynchronous Capture Rule

> **Any value a nova reads from an outer orbit is automatically shared-drifted into the nova's orbit. If the outer orbit decays while the nova is active, the nova automatically inherits full ownership.**

```orbit
orbit request_handler {
    let session_token = generate_token()

    // Nova automatically captures 'session_token' via shared-drift
    fire log_analytics(session_token) 

    // request_handler finishes and decays completely right here.
} 

// Meanwhile, in the background event loop:
nova log_analytics(token: Token) {
    // Because request_handler decayed early, this nova instantly inherits 
    // total, exclusive ownership of 'token'. The value remains safe until 
    // this nova completes its execution and clears its own decay chain.
    write_to_db(token)
}

```

---

## Summary Core Architectural Matrix

| Symbol / Keyword | Visual Meaning | Operational Context |
| --- | --- | --- |
| `:` | *"this is of type"* | Variable declarations, function return types |
| `=>` | *"this produces"* | Pattern matching arms |
| `..` / `..=` | Range boundaries | Loop iterations, slice generation (Exclusive / Inclusive) |
| `orbit { ... }` | Responsibility Frame | Establishes stack-allocated tracking scopes |
| `drift a -> b` | Atomic Hand-off | Transitions ownership state through a monitored transit block |
| `decay { ... }` | Guaranteed Reset | Enforces deterministic cleanup chains (inner to outer) upon scope exit |
| `fire` / `nova` | Disconnected Post | Publishes payloads to decoupled, non-blocking asynchronous event loops |
