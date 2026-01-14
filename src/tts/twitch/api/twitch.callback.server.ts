import {
	HttpApi,
	HttpApiBuilder,
	HttpApiEndpoint,
	HttpApiGroup,
	HttpApiSwagger,
	HttpClientRequest,
	HttpClientResponse,
	Url,
	UrlParams,
} from "@effect/platform";
import { HttpClient } from "@effect/platform/HttpClient";
import { BunHttpServer } from "@effect/platform-bun";
import { Effect, Either, Layer, pipe, Redacted, Schema } from "effect";
import { loadTwitchConfig, TWITCH_OAUTH_TOKEN_URL } from "./twich.config";

const CallbackApiInterface = HttpApi.make("CallbackAPI").add(
	HttpApiGroup.make("Callback")
		.add(
			HttpApiEndpoint.get("callback")`/oauth/twitch/callback`.addSuccess(
				Schema.String,
			),
		)
		.add(
			HttpApiEndpoint.get("token")`/oauth/twitch/token`.addSuccess(
				Schema.String,
			),
		),
);

const CallbackApiLive = HttpApiBuilder.group(
	CallbackApiInterface,
	"Callback",
	(handlers) =>
		handlers
			.handle("callback", (request) =>
				Effect.gen(function* () {
					const urlEither = Url.fromString(request.request.originalUrl);

					if (Either.isRight(urlEither)) {
						const url = urlEither.right;
						const sp = url.searchParams;

						const code = sp.get("code") ?? ""; // FIX THIS
						// const _scope = sp.get("scope");
						yield* getUserToken(code).pipe(
							Effect.orDieWith((error) => console.log(error)),
						);
						// TODO: Continue
					}
					yield* Effect.logInfo(request);

					return "ELO";
				}),
			)
			.handle("token", (request) =>
				Effect.gen(function* () {
					yield* Effect.logInfo("Token Redirect", request);
					return "Token Brany";
				}),
			),
);

const getUserToken = (code: string) =>
	Effect.gen(function* () {
		const client = yield* HttpClient;
		const config = yield* loadTwitchConfig;

		const cr = HttpClientRequest.post(TWITCH_OAUTH_TOKEN_URL).pipe(
			HttpClientRequest.bodyUrlParams(
				pipe(
					UrlParams.empty,
					UrlParams.append("client_id", Redacted.value(config.clientId)),
					UrlParams.append(
						"client_secret",
						Redacted.value(config.clientSecret),
					),
					UrlParams.append("code", code),
					UrlParams.append("grant_type", "authorization_code"),
					UrlParams.append(
						"redirect_uri",
						"https://127.0.0.1:4399/oauth/twitch/token",
					),
				),
			),
		);
		yield* Effect.logInfo("Request: ", cr);
		const raw_response = yield* client.execute(cr);

		// Token Format
		// {
		//   access_token: "token",
		//   expires_in: 13248,
		//   refresh_token: "r_token",
		//   scope: [ "user:bot" ],
		//   token_type: "bearer",
		// }
		const tokens = pipe(
			raw_response,
			HttpClientResponse.schemaBodyJson(
				Schema.Struct({
					access_token: Schema.String,
					expires_in: Schema.Number,
					refresh_token: Schema.String,
					scope: Schema.Array(Schema.String),
					token_type: Schema.Literal("bearer"),
				}),
			),
		);

		return yield* tokens;
	});

const Callback = HttpApiBuilder.api(CallbackApiInterface).pipe(
	Layer.provide(CallbackApiLive),
);

export const CallbackServer = HttpApiBuilder.serve().pipe(
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
