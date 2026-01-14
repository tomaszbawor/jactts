import { FetchHttpClient } from "@effect/platform";
import {
	BunContext,
	BunHttpPlatform,
	BunRuntime,
	BunSocket,
} from "@effect/platform-bun";
import { Effect, Layer } from "effect";
import { TextToSpeechService } from "./tts/TTSService";
// import { loadTwitchConfig } from "./tts/twitch/api/twich.config";
import { twixAPi } from "./tts/twitch/api/twitch.api-client";

const program = Effect.gen(function* () {
	yield* Effect.logInfo("Initializing application ...");

	// const config = yield* loadTwitchConfig;

	// yield* websocketConnect;
	yield* twixAPi;
	//
	// yield* Effect.logInfo("Config: ", config);

	yield* Effect.logInfo("Finishing ... ");
});

const programWithDeps = program.pipe(
	Effect.provide(
		Layer.mergeAll(
			BunContext.layer,
			TextToSpeechService.Default,
			BunSocket.layerWebSocketConstructor,
			BunHttpPlatform.layer,
			FetchHttpClient.layer,
		),
	),
	Effect.scoped,
);

BunRuntime.runMain(programWithDeps);
