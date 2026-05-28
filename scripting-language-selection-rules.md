---
title: Scripting Language Selection Rules
description: Decision framework for picking the right scripting / programming
    language for a given automation, tool, or one-off task — Python as the
    default, PowerShell as the cross-platform shell-glue, a systems-language
    tier (C / Go / Rust / Zig) for CPU-bound work, and a special-occasion tier
    (Java / C# / Node.js / PHP) reserved for ecosystem-driven cases.
category: Tooling & Workflows
---


# Scripting Language Selection Rules

This document codifies the agent's language-selection discipline. It overrides any
older "default to PowerShell" implication in [`script-management-rules.md`](./script-management-rules.md)
for **new** scripts; existing PowerShell scripts remain in place under their own
rules until naturally retired.

The discipline is **practical, not theoretical** — every recommendation below is
backed by an observed working-session pain point or a measured capability
difference, not by language preference.

***

## 1. The four tiers

| Tier | Language | Role | When to reach for it |
|---|---|---|---|
| **1 — Default** | **Python 3.12+** | General-purpose automation, file processing, data munging, REST clients, agent helper scripts | EVERY new automation script unless one of the rules in §3–§5 overrides it |
| **2 — Shell glue** | **PowerShell 7+ (`pwsh`)** | OS-level orchestration where the script's body IS shell commands (process invocation, env management, pipeline of native tools) | When the script is ≤ 80% "call other binaries in sequence" and ≥ 20% boilerplate would be needed to do the same in Python |
| **3 — Systems / CPU-bound** | **C** (default), **Go** (services / concurrency), **Rust** (memory-safety-critical), **Zig** (single-source-file portable C replacement) | CPU-bound, memory-bound, or latency-bound work where Python is measurably the bottleneck | After a *measured* Python prototype proves the bottleneck (see §4); never speculatively |
| **4 — Special occasion** | **Java**, **C#**, **Node.js / TypeScript**, **PHP** | Ecosystem-driven: the unique value lives in an existing library, runtime, or platform that only this language can reach | Only when the destination platform mandates it, or when the canonical library for the problem only exists here (see §5) |

***

## 2. Tier 1 — Python is the default

### 2.1 Why Python first

- **Cross-platform parity**: identical behaviour on Windows, Linux, macOS. No
  per-OS shell quoting hazards, no PS 5.1 vs `pwsh` encoding gap (see
  [`shell-execution-rules.md`](./shell-execution-rules.md) §2.6).
- **Byte-safe I/O by default**: `pathlib.Path.write_bytes()` /
  `read_bytes()` / `open(..., encoding='utf-8')` make UTF-8 the path of least
  resistance — the exact failure mode that bit this session four times in
  PowerShell.
- **Standard library covers ~80% of agent-script needs**: `pathlib`, `subprocess`,
  `json`, `csv`, `re`, `argparse`, `urllib.request`, `tomllib`, `dataclasses`,
  `concurrent.futures`, `sqlite3`.
- **One ecosystem for everything**: data, web, CLI, ML, scientific, scripting.
- **Type-checkable**: `pyright` / `mypy` + PEP 695 generics give real static
  guarantees when the script grows beyond a one-shot.
- **AI-agent-fluent**: every model in this class writes correct, idiomatic
  Python first-shot far more reliably than correct PowerShell.

### 2.2 Python project / environment management

- **Preferred tool: [`uv`](https://github.com/astral-sh/uv)** (Astral). One static
  binary that replaces `pip`, `pip-tools`, `pipx`, `venv`, `pyenv`, `poetry`.
  Cross-platform, lockfile-based, 10–100× faster than the alternatives.
- **Project layout**: `pyproject.toml` + `uv.lock` checked in;
  `.venv/` git-ignored. Run scripts with `uv run script.py` — no manual
  activate / deactivate.
- **One-shot scripts**: PEP 723 inline metadata + `uv run --script foo.py`
  gives a self-contained file with its dependencies declared in a top comment;
  ideal for the agent's helper scripts (e.g., `insert_agents_row.py`).
- **Pinned interpreter**: declare the Python minor version in `pyproject.toml`
  `requires-python = ">=3.12"` and let `uv` fetch it.
- **Existing script-management-rules folder**: Python helpers belong in a
  `python-scripts/` submodule (mirror of the `powershell-scripts/` pattern in
  [`script-management-rules.md`](./script-management-rules.md)) when they are
  reusable across repos; one-shots stay co-located with the work they serve.

### 2.3 Python authoring conventions for agent scripts

- **Byte-safe file edits**: `Path(p).write_bytes(...)`. NEVER `open(p, 'w')`
  without an explicit `encoding='utf-8'`. NEVER `print` non-ASCII to stdout
  on Windows without `sys.stdout.reconfigure(encoding='utf-8')` or
  `PYTHONUTF8=1`.
- **Subprocess discipline**: `subprocess.run([...], check=True, text=True,
  encoding='utf-8')` — list form (never shell=True), explicit UTF-8, fail loudly.
- **Argument parsing**: `argparse` for ≥ 2 args; positional-only for trivial
  scripts; never `sys.argv` slicing in non-trivial code.
- **Lint / format**: `ruff` (lint + format in one binary; also from Astral).
- **Testing**: `pytest` for any script that survives more than one invocation.

### 2.4 What Python is NOT the right tool for

- Scripts whose body is literally "call 5 native binaries in sequence with
  glob expansion" — Tier 2 (`pwsh`) is shorter and clearer.
- Hot inner loops over ≥ 10⁷ items where the work is not vectorisable into
  NumPy / Polars / Arrow — Tier 3 wins on wall-clock by 1–2 orders of
  magnitude.
- Distribution as a single static binary to non-Python hosts — Tier 3 (Go,
  Rust, Zig) ships an executable; Python needs PyInstaller / Nuitka and ships
  a 20–80 MB blob.

***

## 3. Tier 2 — PowerShell as cross-platform shell glue

### 3.1 The honest practical answer to "does PowerShell work cross-platform?"

**Yes, but only `pwsh` (PowerShell 7+), and with caveats.** `pwsh` runs on
Windows, Linux, and macOS from the same script. In practice:

| Aspect | Reality |
|---|---|
| Core language + cmdlets | Identical across OSes |
| File paths | `Join-Path` works; backslash literals do not portably — always use `/` or `Join-Path` |
| Native-tool invocation | Works, but `which` vs `where.exe` differences appear; prefer `Get-Command` |
| Encoding | `pwsh` defaults to UTF-8 no-BOM on all OSes; the [`shell-execution-rules.md`](./shell-execution-rules.md) §2.6 hazards are PS-5.1-specific. *On Windows, the user may still have only `powershell` (5.1) installed* — `pwsh` is a separate install. Scripts MUST declare `#requires -Version 7.0` |
| Process management | `Start-Process` / `Wait-Process` work cross-OS; signal semantics differ |
| Permissions | `chmod` model exists on Linux/macOS but PS abstracts poorly; for non-trivial perms, drop to native shell |
| Module ecosystem | Smaller than Python's; many Windows-only modules (`ActiveDirectory`, `Microsoft.PowerShell.Management` partial); cross-platform modules are limited |

### 3.2 When PowerShell IS the right answer

- **OS orchestration**: launch process A, capture its output, pipe to B,
  inspect environment, set env vars, kill PIDs. Python's `subprocess` is
  verbose for this; PS reads natively.
- **Windows-administrative tasks**: registry, services, WMI, AD, Hyper-V,
  scheduled tasks — Python wrappers exist but are second-class.
- **Single-purpose build / release scripts** that already live inside a
  `tasks.json` / `package.json` / `Makefile` and call a sequence of compilers
  / packagers.
- **The script already exists in `powershell-scripts/`** — no rewrite without a
  reason.

### 3.3 When PowerShell is NOT the right answer (despite being a shell)

- **Anything touching non-ASCII text** without the full §2.6 hardening
  preamble — use Python.
- **Cross-OS distribution to hosts that may not have `pwsh`** — most Linux
  servers do not. Use Python (almost always present) or a Tier-3 static binary.
- **String manipulation / parsing / JSON construction beyond trivial** —
  Python's `json` module + f-strings beat PS here, every time.
- **Long-lived business logic** (ETL, data pipelines, agents) — PS's object
  pipeline is clever but the type system is weaker than Python's; debugging
  scales worse.

### 3.4 PowerShell version policy

- `pwsh` (PowerShell 7+) is the **only** supported version for new scripts.
- `powershell` (5.1) is allowed ONLY for scripts that must run on a stock
  Windows host without an install step (rare). Such scripts MUST follow every
  layer of [`shell-execution-rules.md`](./shell-execution-rules.md) §2.6.
- Per [`script-management-rules.md`](./script-management-rules.md), the
  execution preference is `pwsh-preview` → `pwsh` → (last resort) `powershell`.

***

## 4. Tier 3 — Systems languages for CPU-bound work

### 4.1 The mandatory rule: measure first, port later

NEVER pre-emptively pick a Tier-3 language for performance. The default is
Python. Promote to Tier 3 ONLY after:

1. A working Python prototype exists.
2. Wall-clock or memory measurements prove Python is the bottleneck (e.g.,
   `time` + `tracemalloc` + a target SLA).
3. Vectorising the hot path into NumPy / Polars / `cffi` has been tried and
   rejected (or is structurally inapplicable).

This rule exists because picking C up front routinely produces 10× the
development time for a 1.05× wall-clock improvement.

### 4.2 The four candidates and their honest niches

| Language | Single-line summary | Pick it when |
|---|---|---|
| **C** | Universal toolchain (gcc / clang / MSVC / MinGW / tcc), tiny binaries, every OS, every CPU, every embedded target. The reference Tier-3 default. | The task is genuinely procedural, the dependencies are zero, and the result must compile *anywhere*. Reference: the `split_log.c` program in [`large-text-file-stream-split`](../.agents/skills/large-text-file-stream-split/SKILL.md). |
| **Go** | Static binary, built-in concurrency (`goroutines`), excellent stdlib for networking and CLI, fast compile, gentle learning curve. | Network services, CLI tools that ship as a single binary to ops, parallel I/O-fan-out. Garbage-collected — don't use for hard real-time. |
| **Rust** | Memory safety without GC, sub-millisecond latencies, exceptional type system, but steepest learning curve and longest compile times. | Memory-safety-critical work (parsers, crypto, anything exposed to untrusted input), latency-sensitive code, or where the maintainability tax of C is unacceptable. |
| **Zig** | "Better C" — manual memory, no hidden control flow, single-binary cross-compilation as a *first-class* feature, can call into C trivially. Younger ecosystem (pre-1.0 in 2026). | Cross-compiling a single source file to N targets (Windows / Linux / macOS / WASM) without setting up a toolchain per host; reaching for C ergonomics without the C footguns. |

### 4.3 Default within Tier 3

- **C** is the default Tier-3 choice unless the task explicitly benefits from
  Go's concurrency, Rust's safety, or Zig's cross-compile story.
- **Go** is the default when the deliverable is a network service or a CLI to
  ship cross-OS as a single binary with zero runtime deps.
- **Rust** is preferred over C when the input is untrusted, when the codebase
  will outlive its author, or when the team already runs Rust.
- **Zig** is preferred over C when the deliverable is a single source file that
  must cross-compile to multiple targets from one host, AND the ≤ 1.0 ecosystem
  risk is acceptable.

### 4.4 Integration pattern with Python

The agent's normal pattern is **Python orchestration + Tier-3 inner loop**:

- `cffi` / `ctypes` to call C from Python (zero overhead).
- `PyO3` to call Rust from Python (zero overhead, type-safe boundary).
- `cgo` is rarely worth it; prefer shelling out to a Go binary via `subprocess`.
- Direct `subprocess.run([...])` is always an acceptable fallback when the
  Tier-3 piece is large enough to deserve its own binary.

***

## 5. Tier 4 — Special-occasion languages

The agent reaches for these ONLY when one of the conditions below is met. The
language is otherwise off the table — *not because it is bad*, but because
Tiers 1–3 cover the general case better.

### 5.1 Java

- The deliverable runs inside an existing JVM workflow (Eclipse plugin, Tycho
  build, Maven module, OSGi bundle).
- The unique-value library only exists on the JVM (e.g., EMF, Sphinx, Xtext,
  Drools, Spark, Hadoop, Flink, Bouncy Castle's enterprise features).
- The destination platform mandates Java (Android instrumentation, certain
  enterprise integration buses).

Reference applications: the `bosch-tul-pde-integration`,
`java-vendored-snapshot-compile-check`, `java-classpath-telemetry-integration`,
and `eclipse-pde-jdk-migration` skills.

### 5.2 C# / .NET

- Windows-administrative tooling that goes deeper than `pwsh` permits
  (P/Invoke, custom WMI providers, COM interop, in-proc PowerShell hosting).
- Unity game-engine work.
- Existing .NET solution into which the new code must integrate.

For "I need a fast Windows CLI", prefer C / Go / Rust — they ship without a
runtime.

### 5.3 Node.js / TypeScript

- The deliverable is a VS Code extension, an MCP server, a browser-targeting
  bundle, or any workload that lives inside the npm ecosystem.
- Frontend / full-stack JavaScript projects (Next.js, Vite, Remix).
- A library exists only on npm and a Python equivalent is too immature
  (rare in 2026, but happens for some bleeding-edge web specs).

For backend services, prefer Python (Tier 1) or Go (Tier 3). For CLI tools,
prefer Python or Go — Node-CLI distribution still requires a Node runtime.

### 5.4 PHP

- The deliverable runs inside an existing PHP application (WordPress plugin,
  Laravel module, Drupal extension, legacy LAMP codebase).
- That is the *entire* list. No new PHP for greenfield work.

### 5.5 The long-tail languages (reference table)

Everything below is **Tier 4 by exception only**. The agent MUST NOT pick any
of these for a greenfield task; they appear in the workflow only when a
pre-existing artifact, platform mandate, or domain canon forces the choice.
Grouped by why-they-might-show-up:

| Group | Languages | Sole trigger for picking it | What to do otherwise |
|---|---|---|---|
| **Legacy enterprise** | COBOL, ABAP, X++, Visual Basic (VB6 / VBA), VBScript, Delphi, Pascal, CFML (ColdFusion) | Maintaining the existing system; no rewrite scope | Wrap with Python / Go via subprocess or REST and keep new code in Tier 1–3 |
| **Mobile / Apple / Google** | Swift, Kotlin, Dart | Native iOS (Swift) / native Android (Kotlin) / Flutter (Dart) is the chosen target platform | If the deliverable is cross-platform mobile, prefer Flutter (Dart) or React Native (TS, Tier 4 §5.3) |
| **JVM polyglot** | Scala, Clojure, Kotlin (server-side) | Existing JVM codebase already uses it, OR canonical library (Spark→Scala, Datomic→Clojure) demands it | New JVM work → Java per §5.1, or escape the JVM to Tier 1–3 |
| **Scientific / numeric** | R, Julia, MATLAB, SAS, Fortran | Domain canon: R for statistics packages (CRAN), Julia for high-perf array math with Python-level ergonomics, MATLAB/Simulink for control engineering, SAS for regulated analytics (pharma/finance), Fortran for legacy HPC kernels (LAPACK, climate models) | Python + NumPy / SciPy / Polars / JAX covers ~95% of new work; Julia is the only one worth considering as a Python *alternative* for new perf-critical numeric code |
| **Functional / academic** | Haskell, OCaml, Caml (historic), SML / "Meta Language" (historic), F#, Erlang, Lisp (Common Lisp, Scheme), Prolog | Existing codebase uses it; or Erlang/Elixir for soft-real-time fault-tolerant messaging (telecom, WhatsApp); or Prolog for logic-programming research | Greenfield "I want types + immutability" → Rust or TypeScript; greenfield concurrency → Go or Erlang only if BEAM is justified |
| **Embedded scripting** | Lua, GML (GameMaker Language), Scratch | Embedded inside the host (Lua in Redis/NGINX/Roblox/LÖVE; GML in GameMaker; Scratch for education) | Outside the host runtime, none of these apply |
| **Systems-low-level** | Assembly (x86 / x86-64 / ARM / RISC-V), Ada | Assembly: handwritten cryptographic primitive, ISR, JIT codegen, or vectorised inner loop after Tier-3 is proven insufficient. Ada: safety-certified avionics/defence/medical (DO-178C, SPARK subset) | Otherwise Tier 3 (C / Rust / Zig) gives 99% of the perf with 10% of the maintenance cost |
| **Data / query** | SQL (every dialect), Ladder Logic | SQL: ALWAYS the right answer for relational data; not really "scripting" in the Tier sense — it's a data language used FROM Tier 1–3. Ladder Logic: PLC / industrial control (IEC 61131-3) — the only sensible choice on that hardware | SQL is mandatory for relational queries; never reimplement it in Python loops |
| **Niche-by-design** | D, Perl, Ruby | D: Tier-3-class capability with negligible 2026 ecosystem — pick C / Go / Rust / Zig instead. Perl: legacy `*.pl` maintenance only; nothing greenfield. Ruby: existing Rails app maintenance only; greenfield web → Python (Django/FastAPI), TS (Next.js), or Go | All three lose to a Tier-1/2/3 choice for any new task |

#### 5.5.1 Notes on specific entries

- **SQL** is not in any tier because it is a **data language**, not a scripting
  language. It is mandatory whenever the data lives in a relational store;
  use it FROM Tier 1 (Python `sqlalchemy` / `psycopg` / `sqlite3`) or Tier 3
  (Go `database/sql`). Never simulate joins in application code.
- **Assembly** is below Tier 3, not above it. Reach for it only after a
  Tier-3 implementation is proven insufficient AND a profiler points to a
  specific instruction-level bottleneck. Inline asm via `asm!` in Rust or
  `__asm` in C is preferred over standalone `.s` files.
- **Julia** is the one entry in this table that could plausibly *replace*
  Tier 1 for a new project — specifically when the work is ≥ 80% numeric
  arrays and the team has Julia expertise. For mixed scripting + numerics,
  Python still wins on ecosystem.
- **Kotlin** appears twice (Android tier 4 §5.5 mobile group; server-side
  JVM polyglot group). Pick it ONLY for Android; for JVM server work prefer
  Java (§5.1) unless a Kotlin-only library is mandatory.
- **F#** belongs in the JVM-polyglot row's spirit but actually runs on .NET;
  pick it only when extending an existing F# codebase. Greenfield .NET → C#
  (§5.2).
- **VBScript** is end-of-life on Windows 11 24H2+; do not write new VBScript
  under any circumstance. Existing `.vbs` should be ported to `pwsh` or
  Python at next maintenance opportunity.
- **"Meta Language" / SML / Caml** are listed for completeness; in 2026 they
  appear only in academic codebases. OCaml is the living descendant; treat
  it as the JVM-polyglot row's functional cousin.
- **Scratch** is pedagogical; it does not appear in any production workflow.

#### 5.5.2 The single rule that covers the whole long tail

> If a language is in §5.5 and the deliverable is **not** maintenance of an
> existing artifact in that language, the answer is "no, use Tier 1–3
> instead". The agent MUST justify in writing — in the script's header or
> the PR description — which existing artifact, platform mandate, or
> canonical library forced the choice.

***

## 6. The decision tree (single page)

```text
                       ┌─────────────────────────────┐
                       │   New script / tool needed  │
                       └──────────────┬──────────────┘
                                      │
                                      ▼
                  ┌─────────────────────────────────────┐
                  │ Is the body ≥ 80% native-process    │
                  │ orchestration (call A, pipe to B,   │
                  │ env-manage, kill PIDs) on Windows   │
                  │ or in a hybrid shell context?       │
                  └──────────────┬──────────────────────┘
                       Yes       │       No
                ┌────────────────┘       └──────────────────┐
                ▼                                           ▼
       ┌─────────────────┐                ┌─────────────────────────────────┐
       │ Tier 2: pwsh    │                │ Is the canonical library /      │
       │ (PowerShell 7+) │                │ runtime / platform Java / C# /  │
       │  + §2.6 if 5.1  │                │ Node / PHP?                     │
       └─────────────────┘                └──────────────┬──────────────────┘
                                              Yes        │        No
                                       ┌─────────────────┘        └──────────┐
                                       ▼                                     ▼
                              ┌─────────────────┐               ┌───────────────────────────┐
                              │ Tier 4:         │               │ Tier 1: Python 3.12+      │
                              │  Java / C# /    │               │  + uv + ruff + pytest     │
                              │  Node / PHP     │               └─────────────┬─────────────┘
                              │  (per §5)       │                             │
                              └─────────────────┘                             │
                                                                              ▼
                                                       ┌────────────────────────────────────┐
                                                       │ Measure: is Python the wall-clock  │
                                                       │ or memory bottleneck? (Have you    │
                                                       │ tried NumPy / Polars / cffi yet?)  │
                                                       └─────────────────┬──────────────────┘
                                                            Yes          │          No
                                                  ┌──────────────────────┘          └──────┐
                                                  ▼                                        ▼
                                       ┌────────────────────┐                 ┌─────────────────────┐
                                       │ Tier 3: C / Go /   │                 │ Stay on Tier 1      │
                                       │  Rust / Zig per §4 │                 │ (Python is enough)  │
                                       └────────────────────┘                 └─────────────────────┘
```

***

## 7. Anti-patterns

| Anti-pattern | Why it's wrong | Correct move |
|---|---|---|
| "Default to PowerShell because we're on Windows" | Loses cross-platform parity; inherits the §2.6 transport-encoding tax | Default to Python; pick `pwsh` only per §3.2 |
| "Pick Rust / C up front because it's a perf-sensitive area" | Pays 10× dev time for typically < 2× wall-clock; obstructs prototyping | Python first; measure; promote per §4.1 |
| "Use Node because everyone knows JavaScript" | Cross-cuts the agent's Tier-1 Python discipline; ships a runtime dependency; weakens text-processing ergonomics | Tier 4 only; Python or Go otherwise |
| "Use Java because there's a Maven artifact for it" | The same library usually has a Python / Go / Rust binding; check before importing the JVM tax | Confirm no Tier-1/2/3 binding exists before Tier 4 |
| "PowerShell 5.1 is fine, we'll just be careful with encoding" | §2.6 documents four real incidents proving "be careful" doesn't scale | `pwsh` required; fall back to 5.1 only when no install step is possible |
| "I'll write the hot loop in Python and `numba`-jit it later" | `numba` adds a heavy import-time cost and is fragile across NumPy versions | If the hot path is real, go to Tier 3 — don't half-measure |
| "Wrap a `python3 - <<PY ... PY` heredoc in a bash file because the entry-point feels shell-shaped" | The script is the wrong tier (Python in shell clothing) AND a [§2.3.3 nested-heredoc silent-hang hazard](./shell-execution-rules.md); the bash wrapper buys nothing argparse + pathlib doesn't do natively | Port to a pure `.py` per [`script-language-tier-port`](../.agents/skills/script-language-tier-port/SKILL.md) |

***

## 8. Relationship to neighbouring rules

- [`script-management-rules.md`](./script-management-rules.md) — folder layout,
  per-language scripts submodule, `Common-Utils` pattern. This document
  **overrides** its "default to PowerShell" line for **new** scripts; existing
  PS scripts continue under that document's rules.
- [`shell-execution-rules.md`](./shell-execution-rules.md) §2.4–§2.6 — the
  PowerShell encoding hazards that motivate Python's Tier-1 status.
- [`bash-scripting-rules.md`](./bash-scripting-rules.md) — when the chosen
  Tier-2 shell is bash rather than `pwsh`.
- [`script-language-tier-port`](../.agents/skills/script-language-tier-port/SKILL.md) — the
  remediation skill: when an EXISTING script is found to have picked the wrong
  tier (typically a bash wrapper around a Python heredoc, or a `.sh` doing JSON /
  regex work), this document defines WHICH tier is correct; the port skill defines
  HOW to migrate it (line-accounting → idiomatic translation → byte-parity smoke
  test → atomic refactor commit).
- [`python-script-generation`](../.agents/skills/python-script-generation/SKILL.md)
  skill — authoring standards for Tier-1 Python scripts.
- [`large-text-file-stream-split`](../.agents/skills/large-text-file-stream-split/SKILL.md)
  skill — reference application of Tier-3 C with a Tier-2 `pwsh` build wrapper.

***

## 9. TL;DR

1. **Default to Python 3.12+** with `uv` for project management.
2. Use **`pwsh` (PowerShell 7+)** only when the script's body is mostly shell
   orchestration. `powershell` (5.1) only as a last resort, under
   [`shell-execution-rules.md`](./shell-execution-rules.md) §2.6.
3. Reach for **C / Go / Rust / Zig** ONLY after measuring that Python is the
   bottleneck. C is the Tier-3 default; pick Go/Rust/Zig per §4.3.
4. Touch **Java / C# / Node / PHP** ONLY when the destination platform or
   canonical library makes it the *only* sensible choice.
