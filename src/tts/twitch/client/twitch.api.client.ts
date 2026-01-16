import { HttpClientRequest } from "@effect/platform";
import { HttpClient } from "@effect/platform/HttpClient";
import { Effect, Schema } from "effect";
import { CHANNEL_MESSAGE_SUB_TYPE } from "./event.subscription-types";

const TWITCH_EVENTSUB_SUBSCRIPTION_ENDPOINT =
	"https://api.twitch.tv/helix/eventsub/subscriptions";

export class TwitchApiClientService extends Effect.Service<TwitchApiClientService>()(
	"TTSService",
	{
		effect: Effect.gen(function* () {
			const httpClient = yield* HttpClient;

			return {
				doSomething: () => Effect.logInfo("Cos robie ziomek"),

				subscribeToEvent: () =>
					// TODO: FIX STUFF
					Effect.gen(function* () {
						yield* Effect.logInfo("Sub to event request ...");
						const subRequest = yield* HttpClientRequest.post(
							TWITCH_EVENTSUB_SUBSCRIPTION_ENDPOINT,
						).pipe(
							HttpClientRequest.schemaBodyJson(
								CreateEventSubSubscriptionRequestBodySchema,
							)({
								type: CHANNEL_MESSAGE_SUB_TYPE,
								version: "2",
								condition: {},
								transport: {},
								method: "websocket",
								callback: null,
								secret: null,
								session_id: null,
								conduit_id: null,
							}),
						);

						yield* Effect.logInfo("Taki Request wysylamy po sub: ", subRequest);

						const response = yield* httpClient.execute(subRequest);
						yield* Effect.logInfo("Taki Response dostalimy: ", response);
						return response;
					}),
			};
		}),
	},
) {}

const CreateEventSubSubscriptionRequestBodySchema = Schema.Struct({
	type: Schema.String,
	version: Schema.String,
	condition: Schema.Any,
	transport: Schema.Any,
	method: Schema.String,
	callback: Schema.NullOr(Schema.String),
	secret: Schema.NullOr(Schema.String),
	session_id: Schema.NullOr(Schema.String),
	conduit_id: Schema.NullOr(Schema.String),
});
