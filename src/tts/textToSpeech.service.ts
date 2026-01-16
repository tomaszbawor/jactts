import { Effect, Queue, Stream } from "effect";

export interface CreateTtsRequest {
	text: string;
	nick: string;
}

export const MAX_MESSAGE_QUEUE_SIZE = 10;

export class TextToSpeechService extends Effect.Service<TextToSpeechService>()(
	"TTSService",
	{
		accessors: true,
		effect: Effect.gen(function* () {
			const messageQueue = yield* Queue.bounded<CreateTtsRequest>(
				MAX_MESSAGE_QUEUE_SIZE,
			);

			return {
				pushMessage: (msg: CreateTtsRequest) =>
					Effect.gen(function* () {
						// yield* Effect.logInfo("Adding message: ", msg);
						const result = yield* messageQueue.offer(msg);
						const queueSize = yield* messageQueue.size;
						yield* Effect.logInfo(`Current queue size: ${queueSize}`);
						return result;
					}),
				eventStream: Stream.fromQueue(messageQueue),
			};
		}),
	},
) {}
