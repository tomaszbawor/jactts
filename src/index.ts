import { BunContext, BunRuntime, BunSocket } from "@effect/platform-bun";
import { Effect, Layer } from "effect";
import { TextToSpeechService } from "./tts/TTSService";
import { websocketConnect } from "./tts/twitch/twitch.ws.client";

const program = Effect.gen(function* () {
	yield* Effect.logInfo("Initializing application ...");

	yield* websocketConnect;

	yield* Effect.logInfo("Finishing ... ");
});

const programWithDeps = program.pipe(
	Effect.provide(
		Layer.mergeAll(
			BunContext.layer,
			TextToSpeechService.Default,
			BunSocket.layerWebSocketConstructor,
		),
	),
	Effect.scoped,
);

BunRuntime.runMain(programWithDeps);
