import { BunContext, BunRuntime } from "@effect/platform-bun";
import { faker } from "@faker-js/faker/locale/pl";
import { Effect, Fiber, Layer, Schedule, Stream } from "effect";
import { TextToSpeechService } from "./tts/TTSService";

//
// const backtroundConsumerTask = (queue: Queue.Queue<string>) => {
// 	return Effect.gen(function* () {
// 		while (true) {
// 			const msg = yield* queue.take;
// 			yield* Effect.logInfo("Just got message ", msg);
// 			yield* Effect.sleep("70 millis");
// 		}
// 	});
// };
//

const messageProducer = (ts: TextToSpeechService) =>
	Effect.gen(function* () {
		const nick = faker.internet.displayName();
		const message = faker.lorem.sentences();

		yield* ts.pushMessage({
			nick: nick,
			text: message,
		});
	});

const program = Effect.gen(function* () {
	yield* Effect.logInfo("Initializing ...");
	const ttservice = yield* TextToSpeechService;

	const stream = ttservice.eventStream;
	const str = stream.pipe(
		Stream.tap((msg) =>
			Effect.gen(function* () {
				yield* Effect.logInfo(msg);
			}),
		),
		Stream.runDrain,
	);

	const fiberCOn = yield* Effect.fork(str);

	const producer = messageProducer(ttservice).pipe(
		Effect.repeat(
			Schedule.intersect(Schedule.spaced("200 millis"), Schedule.recurs(20)),
		),
	);

	const fiber = yield* Effect.fork(producer);

	yield* Fiber.join(fiber);
	yield* Fiber.join(fiberCOn);

	yield* Effect.logInfo("Finishing ...");
});

const programWithDeps = program.pipe(
	Effect.provide(Layer.mergeAll(BunContext.layer, TextToSpeechService.Default)),
);

BunRuntime.runMain(programWithDeps);
