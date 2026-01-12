import { makeWebSocket } from "@effect/platform/Socket";
import { Effect, Fiber, Schema } from "effect";
import { TWITCH_WS_URL } from "./config";
import { SessionWelcomeSchema } from "./messages/SessionWelcome";

export const websocketConnect = Effect.gen(function* () {
	const ws = yield* makeWebSocket(TWITCH_WS_URL);

	const readerFiber = yield* Effect.fork(
		ws.run((msgBytes) =>
			Effect.gen(function* () {
				const welcomeMessage = yield* decodeSchemaFromByteArray(msgBytes);
				yield* Effect.logInfo("Incoming message: ", welcomeMessage);
			}),
		),
	);

	yield* readerFiber;

	// const wr = yield* ws.writer;
	// yield* wr("hello");
	yield* Fiber.join(readerFiber);
});

// Make it generic for all messages
const decodeSchemaFromByteArray = (bytes: Uint8Array) =>
	Effect.gen(function* () {
		const text = new TextDecoder().decode(bytes);

		const json = yield* Effect.try({
			try: () => JSON.parse(text),
			//TODO: Change this error into custom one
			catch: (_e) => new Error("Invalid Json"),
		});

		return yield* Schema.decodeUnknown(SessionWelcomeSchema)(json);
	});
