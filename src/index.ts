import { FetchHttpClient } from "@effect/platform";
import {
	BunContext,
	BunHttpPlatform,
	BunRuntime,
	BunSocket,
} from "@effect/platform-bun";
import { Effect, Fiber, Layer } from "effect";
import { TextToSpeechService } from "./tts/TTSService";
import { openTwichAuthorization } from "./tts/twitch/api/twitch.api-client";
import { ServerLive } from "./tts/twitch/api/twitch.redirect";

const program = Effect.gen(function* () {
	yield* Effect.logInfo("Initializing application ...");

	// 1. Run HTTP Server with oauth callback
	const callbackApiServer = yield* Effect.fork(Layer.launch(ServerLive));
	// 1. Open browser with URL for getting auth code

	yield* openTwichAuthorization;

	// 1. Get the Auth code from callback and store it in application
	// 1. Start web socket connections and sub for messages
	// 1. Profit

	// yield* websocketConnect;
	// yield* twixAPi;

	return yield* Fiber.join(callbackApiServer);
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
