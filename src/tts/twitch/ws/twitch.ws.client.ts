import { makeWebSocket } from "@effect/platform/Socket";
import { Data, Effect, Schema } from "effect";
import { TWITCH_WS_URL } from "../config";
import {
	type SessionWelcomeSchema,
	TwitchWebSocketMessage,
} from "./twitch.ws.messages";

class TwitchWsError extends Data.TaggedError("TwitchWsError")<{
	message: string;
	// biome-ignore lint/suspicious/noExplicitAny: Its fine its error
	cause: any;
}> {}

export const websocketConnect = (
	setSessionIdCallback: (sessionId: string) => void,
) =>
	Effect.gen(function* () {
		const ws = yield* makeWebSocket(TWITCH_WS_URL);

		const readerFiber = yield* Effect.fork(
			ws.run((msgBytes) =>
				Effect.gen(function* () {
					const wsMessage = yield* decodeSchemaFromByteArray(msgBytes);

					if (isWelcomeMessage(wsMessage)) {
						const sessionId = wsMessage.payload.session.id;
						setSessionIdCallback(sessionId);
					}

					yield* Effect.logInfo("Incoming message: ", wsMessage);
				}),
			),
		);

		yield* readerFiber;
		return readerFiber;
	});

function isWelcomeMessage(
	msg: typeof TwitchWebSocketMessage.Type,
): msg is typeof SessionWelcomeSchema.Type {
	return msg.metadata.message_type === "session_welcome";
}

// Make it generic for all messages
const decodeSchemaFromByteArray = (bytes: Uint8Array) =>
	Effect.gen(function* () {
		const text = new TextDecoder().decode(bytes);

		const json = yield* Effect.try({
			try: () => JSON.parse(text),
			catch: (e) =>
				new TwitchWsError({
					message: "Unable to parse json",
					cause: e,
				}),
		});

		return yield* Schema.decodeUnknown(TwitchWebSocketMessage)(json);
	});
