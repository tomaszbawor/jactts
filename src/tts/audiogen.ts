import { Command, FileSystem } from "@effect/platform";
import { Effect } from "effect";

export const generateTTSAudio = (
	text: string,
	outputFile: string = "out.wav",
) =>
	Effect.gen(function* () {
		yield* Effect.logInfo("Output file: ", outputFile);

		const baseCommand = Command.make(
			"piper",
			"-m",
			"./piper/voices/pl_PL-mc_speech-medium.onnx",
			"--output-file",
			`${outputFile}`, // TODO: Sanitize it
		);

		const textGenerationCommand = baseCommand.pipe(Command.feed(text));

		const piperReturnCode = yield* Command.exitCode(textGenerationCommand);

		if (piperReturnCode > 0) {
			yield* Effect.logError(
				"Error while generating TTS, returned status",
				piperReturnCode,
			);
		}
	});

export const generateTempWavFilename = Effect.gen(function* () {
	const fs = yield* FileSystem.FileSystem;
	return yield* fs.makeTempFile({
		suffix: ".wav",
	});
});

export const playAudio = (fileName: string) =>
	Effect.gen(function* () {
		const playCommand = Command.make("aplay", fileName);

		const playReturnCode = yield* Command.exitCode(playCommand);

		if (playReturnCode > 0) {
			//TODO: Replace with yieldable effect errors
			yield* Effect.logError(
				"Unable to play, got return code ",
				playReturnCode,
			);
		}
	});
