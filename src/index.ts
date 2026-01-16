import { FetchHttpClient } from "@effect/platform";
import {
	BunContext,
	BunHttpPlatform,
	BunRuntime,
	BunSocket,
} from "@effect/platform-bun";
import { Effect, Layer } from "effect";
import { TextToSpeechService } from "./tts/TTSService";
import { TwitchApiClientService } from "./tts/twitch/client/twitch.api.client";

const program = Effect.gen(function* () {
	yield* Effect.logInfo("Initializing application ...");

	// 1. Run HTTP Server with oauth callback
	// const callbackApiServer = yield* Effect.fork(Layer.launch(CallbackServer));
	// 2. Open browser with URL for getting auth code
	// yield* openTwichAuthorization;

	// 3. Get the Auth code from callback and store it in application
	// TODO:
	//
	// 1. Start web socket connections and sub for messages

	// yield* websocketConnect;
	// yield* twixAPi;
	//
	const ApiClient = yield* TwitchApiClientService;
	yield* ApiClient.subscribeToEvent();

	// return yield* Fiber.join(callbackApiServer);
});

const programWithDeps = program.pipe(
	Effect.provide(
		Layer.mergeAll(
			BunContext.layer,
			TextToSpeechService.Default,
			BunSocket.layerWebSocketConstructor,
			BunHttpPlatform.layer,
			TwitchApiClientService.Default,
		),
	),
	Effect.scoped,
	Effect.provide(FetchHttpClient.layer),
);

BunRuntime.runMain(programWithDeps);
