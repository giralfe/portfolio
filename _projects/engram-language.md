---
layout: project
title: Engram
period: "2025"
year: 2025
sort_date: "2025-07"
tags: [Compilers, Tools, Java, Team]
image: /assets/engram-language/thumbnail-card.jpg
role: Code generator, expressions and game integration (pair project)
platform: Xtext / Xtend / EMF · Rascal · Java · libGDX + gdx-ai
priority: 12
summary: "A domain-specific language for NPC behaviour, built in a pair for TU/e's DSL Design course (2IMP20). Engram describes state machines with typed variables, guarded transitions and expressions; it is checked in an Xtext editor and compiled by an Xtend generator into gdx-ai state machines for a libGDX demo game."
---

Engram is a domain-specific language for the behaviour of non-player characters, written with Hamed Ghoochanian for the DSL Design course (2IMP20) at TU/e in June and July 2025. NPC behaviour in games is often a small state machine (states, transitions, guards) expressed in verbose host-language code. An Engram file states only the machine; a generator produces the Java. Each `aiPattern` compiles to two Java files: an enum implementing gdx-ai's `State` interface, with one constant per state holding its enter, update and exit logic, and a subclass of a hand-written base class that declares the pattern's variables and sets the initial state. The generated code is used by a libGDX demo game, *Path of the Ronin*, in which every enemy is driven by an Engram file.

Division of work, from the repository history: Hamed wrote the initial grammar (patterns, variables, states, transitions, guards and the logical and comparison expressions) and the validator. I wrote the Xtend code generator, extended the grammar with arithmetic, prefix and postfix expressions and `if`/`else`, extended the type inference to those forms, and built the demo game, its base class and the four example behaviours.

<div class="video-showcase">
  <div class="video-container">
    <video width="960" height="540" poster="{{ '/assets/engram-language/demo-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none">
      <source src="{{ "/assets/engram-language/demo.mp4" | relative_url }}" type="video/mp4">
    </video>
  </div>
  <p class="video-caption">The Brawler pattern in the runtime Eclipse instance: <code>Brawler.engram</code> on the left, the generated <code>BrawlerState.java</code> on the right, and the game window in front. The orange enemy shows its taunt on entering CHASING; the circle is its vision range, and the player's health falls from 100 to 80 as its attacks land.</p>
</div>

---

## The language

```
aiPattern Brawler {
    vars {
        taunt : string = "Get over here!";
    }
    default state IDLE {
        on isPlayerInRange { goto CHASING; }
    }
    state CHASING {
        on enter { do say(taunt); }
        on isPlayerInAttackRange { goto ATTACKING; }
        on isPlayerInRange { do chase_player(); }
        on isPlayerOutOfRange { goto IDLE; }
    }
    state ATTACKING {
        on enter { do swing_sword(); }
        on isSwingFinished { goto CHASING; }
    }
}
```

An `aiPattern` declares typed variables (`int`, `bool`, `string`, with optional initial values) and one or more states, one of which is marked `default`. A state contains transitions of the form `on <event> [when (<guard>)] { <actions> }`. The events `enter` and `exit` are reserved; every other event name is a boolean query on the game entity, such as `isPlayerInRange` or `always`. Actions are `goto`, assignment, `do` calls into the game, postfix increment and decrement, and `if`/`else` blocks. The expression grammar defines precedence by rule nesting, from loosest to tightest binding: `||`, `&&`, comparison (`==`, `!=`, `<`, `<=`, `>`, `>=`), additive, multiplicative, then the prefix operators `!`, `-`, `++` and `--`, and postfix `++` and `--`. Variable references in expressions and `goto` targets are cross-references resolved by Xtext's linker, so a misspelt state or variable is reported in the editor.

---

## Code generation

The generator (`EngramGenerator.xtend`, about 200 lines) walks the EMF model of each pattern and emits `<Name>State.java` and `<Name>.java` into the game's source tree; the output directory is configured per project in the runtime Eclipse instance, so saving an `.engram` file regenerates the Java the game compiles. The mapping is direct:

- each state becomes an enum constant that overrides `enter`, `update` and `exit`;
- each transition on a non-reserved event becomes `if (entity.<event>() && (<guard>)) { ... }` in `update`, so events are polled once per update;
- transitions on `enter` and `exit` become an `if`/`else if` chain in the corresponding hook, with an unguarded transition as the final `else`;
- `goto S` becomes `entity.stateMachine.changeState(<Name>State.S)`, `do f(x)` becomes `entity.f(x)`, and variables become public fields of the generated subclass;
- binary expressions are emitted fully parenthesised, so Java's own precedence cannot change their meaning.

For the CHASING state above, the generated `update` is:

```java
@Override
public void update(Brawler entity) {
    if (entity.isPlayerInAttackRange()) {
        entity.stateMachine.changeState(BrawlerState.ATTACKING);
    }
    if (entity.isPlayerInRange()) {
        entity.chase_player();
    }
    if (entity.isPlayerOutOfRange()) {
        entity.stateMachine.changeState(BrawlerState.IDLE);
    }
}
```

Size of the four example patterns and of the Java generated from them (non-blank, non-comment lines):

| Pattern | States | Engram | Generated Java |
|---|---|---|---|
| Brawler | 3 | 32 | 70 |
| SimpleChaser | 3 | 38 | 73 |
| Phalanx | 5 | 64 | 115 |
| Guardian | 6 | 93 | 150 |

The contract with the game is the hand-written generic base class `BaseAIEntity<T>`, which holds the gdx-ai `DefaultStateMachine` and implements every action and condition the patterns call: 13 actions (movement, sword swings, shield, speech, timers and patrol targets) and 12 boolean conditions (vision range 80 units, attack range 20 units, timers, health). The examples use these to express different behaviours. Guardian patrols between two points by re-entering its own state with a flipped flag, raises an alert, chases, returns to its post after losing the player for two seconds, and switches to FRENZIED when its health is low. Phalanx counts down an integer `patience` variable under guards (`when (patience > 0)`) while provoking the player, blocks when the player attacks, and counter-attacks when the player's attack ends.

<div class="video-showcase">
  <div class="video-container">
    <video width="960" height="540" poster="{{ '/assets/engram-language/behaviours-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none">
      <source src="{{ "/assets/engram-language/behaviours.mp4" | relative_url }}" type="video/mp4">
    </video>
  </div>
  <p class="video-caption">Several generated behaviours in one arena of the demo game (recording of 7 July 2025). The speech lines come from the <code>say</code> actions in the Engram files: "For the Daimyo!" (Guardian entering CHASING), "ENOUGH!" (Guardian entering FRENZIED), "Get over here!" (Brawler entering CHASING), "Come at me!" (Phalanx entering PROVOKING) and "Predictable!" (Phalanx entering BLOCKING after the player attacks).</p>
</div>

---

## Validation and type inference

The validator, written by Hamed, reports errors in the editor as the file is edited:

- an assignment whose value type differs from the variable's declared type;
- a `when` guard that is not boolean;
- a comparison between operands of different types;
- `&&` or `||` applied to non-boolean operands;
- a pattern with no default state, or with more than one;
- states that cannot be reached, found by a breadth-first search over `goto` statements (including those nested in `if` blocks) starting from the default state.

Types are inferred bottom-up: literals and variable references carry their type, comparison and logical expressions are boolean, additive and multiplicative expressions are integers, `!` yields a boolean and the other prefix and postfix operators keep their operand's type. The language does not declare the signatures of the game functions it calls, so a call is typed by naming convention: a function whose name starts with `is` or `has` is boolean, and any other call has an unknown type, which the checks skip.

---

## Rascal prototype

Before the Xtext implementation, an earlier version of the syntax was written in Rascal, the language workbench used in the course's first assignment. It defined `friend` and `enemy` NPCs, states with `on_enter` and `on_update` blocks, transitions of the form `on <event> goto <STATE>;` and an expression grammar using Rascal's priority and associativity declarations, together with a parser and a language-server registration that provides syntax highlighting from the parse tree. It had no checker or generator. The final implementation uses Xtext and EMF, the modelware tool chain of the course's later assignments, where the metamodel, cross-reference linking and generator framework are generated from the grammar.

---

## Demo game

*Path of the Ronin* is a top-down libGDX game (libGDX 1.13.1, gdx-ai 1.8.2, Box2D physics, shape rendering). The player moves upward through arenas of 200 units, each generated when the player crosses into it; every arena after the first contains two Brawlers, one Guardian and one Phalanx, and its exit gate opens once all of them are defeated. The player has a sword attack and a dash with a cooldown. The game exists to exercise the generated code.

---

## Future work

- **Declared game functions.** Actions and conditions are not declared in the language, so argument types and the existence of a called function are checked only when the generated Java is compiled. Declaring them in the language would move those checks into the editor.
- **Transition semantics.** In `update`, every transition whose event holds is executed in source order; there is no first-match rule. In the Brawler's CHASING state, a player in attack range is also in vision range, so the same update calls `changeState(ATTACKING)` and then `chase_player()`. A first-match rule, or a validator check for overlapping events, would make patterns independent of their order.
- **Generator configuration.** The generated package name (`io.github.ronin.ai`) is fixed in the generator; making it a project setting is a small change.
- **Reachability check.** The check carries an open TODO in the source, and its commit describes it as half-working; completing it is the remaining validator task.
- **Tests.** The test project contains only the stub generated by Xtext. Parser, validator and generator tests are the next step.
