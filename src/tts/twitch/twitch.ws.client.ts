import { makeWebSocket } from "@effect/platform/Socket";
import { Data, Effect, Fiber, Schema } from "effect";
import { TWITCH_WS_URL } from "./config";
import { TwitchWebSocketMessage } from "./messages/SessionWelcome";

class TwitchWsError extends Data.TaggedError("TwitchWsError")<{
	message: string;
	// biome-ignore lint/suspicious/noExplicitAny: Its fine its error
	cause: any;
}> {}

export const websocketConnect = Effect.gen(function* () {
	const ws = yield* makeWebSocket(TWITCH_WS_URL);

	const readerFiber = yield* Effect.fork(
		ws.run((msgBytes) =>
			Effect.gen(function* () {
				const welcomeMessage = yield* decodeSchemaFromByteArray(msgBytes);

				if (welcomeMessage.metadata.message_type === "session_welcome") {
					welcomeMessage.payload;
				}

				yield* Effect.logInfo("Incoming message: ", welcomeMessage);
			}),
		),
	);

	yield* readerFiber;

	yield* Fiber.join(readerFiber);
});

// Make it generic for all messages
const decodeSchemaFromByteArray = (bytes: Uint8Array) =>
	Effect.gen(function* () {
		const text = new TextDecoder().decode(bytes);

		const json = yield* Effect.try({
			try: () => JSON.parse(text),
			//TODO: Change this error into custom one
			catch: (e) =>
				new TwitchWsError({
					message: "Unable to parse json",
					cause: e,
				}),
		});

		return yield* Schema.decodeUnknown(TwitchWebSocketMessage)(json);
	});
