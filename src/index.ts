import { Effect } from "effect";

const program = Effect.gen(function* () {
	yield* Effect.logInfo("App started ...");

	yield* Effect.logInfo("Hello from effect");
});

Effect.runSync(program);
