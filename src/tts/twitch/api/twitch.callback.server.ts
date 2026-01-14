import {
	HttpApi,
	HttpApiBuilder,
	HttpApiEndpoint,
	HttpApiGroup,
	HttpApiSwagger,
	Url,
} from "@effect/platform";
import { BunHttpServer } from "@effect/platform-bun";
import { Effect, Either, Layer, Schema } from "effect";

const CallbackApiInterface = HttpApi.make("CallbackAPI").add(
	HttpApiGroup.make("Callback").add(
		HttpApiEndpoint.get("callback")`/oauth/twitch/callback`.addSuccess(
			Schema.String,
		),
	),
);

const CallbackApiLive = HttpApiBuilder.group(
	CallbackApiInterface,
	"Callback",
	(handlers) => {
		return handlers.handle("callback", (request) =>
			Effect.gen(function* () {
				const urlEither = Url.fromString(request.request.originalUrl);

				if (Either.isRight(urlEither)) {
					const url = urlEither.right;
					const sp = url.searchParams;

					const _code = sp.get("code");
					const _scope = sp.get("scope");

					// TODO: Continue
				}
				yield* Effect.logInfo(request);

				return "ELO";
			}),
		);
	},
);

const Callback = HttpApiBuilder.api(CallbackApiInterface).pipe(
	Layer.provide(CallbackApiLive),
);

export const ServerLive = HttpApiBuilder.serve().pipe(
	Layer.provide(HttpApiSwagger.layer()),
	Layer.provide(Callback),
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
