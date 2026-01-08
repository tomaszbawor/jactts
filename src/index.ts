import { BunContext, BunRuntime } from "@effect/platform-bun";
import { Effect } from "effect";

const program = Effect.gen(function* () {
	yield* Effect.logInfo("App started ...");
	yield* Effect.logInfo("Initializing ...");
});

const programWithDeps = program.pipe(Effect.provide(BunContext.layer));

BunRuntime.runMain(programWithDeps);
