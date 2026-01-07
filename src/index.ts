import { FileSystem } from "@effect/platform";
import { BunContext, BunRuntime } from "@effect/platform-bun";
import { Effect } from "effect";
import { generateTTSAudio } from "./tts/audiogen";

const generateTempWavFilename = Effect.gen(function* () {
	const fs = yield* FileSystem.FileSystem;
	return yield* fs.makeTempFile({
		suffix: ".wav",
	});
});

const program = Effect.gen(function* () {
	yield* Effect.logInfo("App started ...");

	const file = yield* generateTempWavFilename;
	yield* generateTTSAudio("Betoniarka rozbujana na polu trzcinowym.", file);
});

const programWithDeps = program.pipe(Effect.provide(BunContext.layer));

BunRuntime.runMain(programWithDeps);
