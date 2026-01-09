import { BunContext, BunRuntime } from "@effect/platform-bun";
import { Effect, type Queue } from "effect";
import { generateTTSAudio } from "./tts/audiogen";

const backgroundProducerTask = (queue: Queue.Queue<string>) => {
	var iterator = 0;

	return Effect.repeat(
		Effect.gen(function* () {
			const msg = `Message ${iterator}`;

			yield* queue.offer(msg);
			yield* Effect.logInfo(`Dodawanie do kolejki ${iterator++}`);
		}),
		Schedule.spaced("100 millis"),
	);
};

const backtroundConsumerTask = (queue: Queue.Queue<string>) => {
	return Effect.gen(function* () {
		while (true) {
			const msg = yield* queue.take;
			yield* Effect.logInfo("Just got message ", msg);
			yield* Effect.sleep("70 millis");
		}
	});
};

const program = Effect.gen(function* () {
	yield* Effect.logInfo("App started ...");
	yield* Effect.logInfo("Initializing ...");

	const duration = r[0];

	yield* Effect.logInfo("Duration: ", duration.toString());
});

const programWithDeps = program.pipe(Effect.provide(BunContext.layer));

// const produceIntoQueue = (queue: Queue) =>
// 	Effect.gen(function* () {
// 		yield* Effect.logInfo("Putting stuff on queue ");
// 		yield* queue.offer("Tomek");
// 	});

BunRuntime.runMain(programWithDeps);
