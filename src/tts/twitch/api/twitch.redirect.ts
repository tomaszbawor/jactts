import {
	HttpApi,
	HttpApiBuilder,
	HttpApiEndpoint,
	HttpApiGroup,
	HttpApiSwagger,
} from "@effect/platform";
import { BunHttpServer } from "@effect/platform-bun";
import { Effect, Layer, Schema } from "effect";

const CallbackApi = HttpApi.make("CallbackAPI").add(
	HttpApiGroup.make("Callback").add(
		HttpApiEndpoint.get("callback")`/oauth/twitch/callback`.addSuccess(
			Schema.String,
		),
	),
);

const ApiLive = HttpApiBuilder.group(CallbackApi, "Callback", (handlers) => {
	return handlers.handle("callback", () =>
		Effect.gen(function* () {
			yield* Effect.logInfo("Mame jestem w tv");
			return "ELO";
		}),
	);
});

const CallbackApiLive = HttpApiBuilder.api(CallbackApi).pipe(
	Layer.provide(ApiLive),
);

export const ServerLive = HttpApiBuilder.serve().pipe(
	Layer.provide(HttpApiSwagger.layer()),
	Layer.provide(CallbackApiLive),
	Layer.provide(
		BunHttpServer.layer({
			port: "4399",
			tls: {
				key: Bun.file("./certs/key.pem"),
				cert: Bun.file("./certs/cert.pem"),
			},
		}),
	),
);

export const serveCallback = Effect.gen(function* () {});
