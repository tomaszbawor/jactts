import { Command } from "@effect/platform";
import { BunContext, BunRuntime } from "@effect/platform-bun";
import { Effect } from "effect";

const generateTTSAudio = (text: string) =>
	Effect.gen(function* () {
		const command = Command.make(
			"piper",
			"-m",
			"./piper/voices/pl_PL-mc_speech-medium.onnx",
			"--output-file",
			"test.wav",
		);

		const c = command.pipe(Command.feed(text));

		const output = yield* Command.exitCode(c);

		if (output > 0) {
			yield* Effect.logError("Cos sie nie udalo ziomek ");
		}

		const playCommand = Command.make("aplay", "test.wav");

		const playStatus = yield* Command.exitCode(playCommand);
		if (playStatus > 0) {
			yield* Effect.logError("Play nie wyszedl... ");
		}
	});

const program = Effect.gen(function* () {
	yield* Effect.logInfo("App started ...");

	yield* generateTTSAudio("Tekst ziomeczku");
});

const programWithDeps = program.pipe(Effect.provide(BunContext.layer));

BunRuntime.runMain(programWithDeps);
