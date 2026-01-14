import { Config, Effect, Schema } from "effect";

export class TwitchConfig extends Schema.Class<TwitchConfig>("TwitchConfig")({
	clientId: Schema.Redacted(Schema.String),
	clientSecret: Schema.Redacted(Schema.String),
	channel: Schema.String,
	oauthRedirectUri: Schema.String,
	oauthTlsCertPath: Schema.String,
	oauthTlsKeyPath: Schema.String,
}) {}

export const loadTwitchConfig = Effect.gen(function* () {
	const clientId = yield* Config.redacted("TWITCH_CLIENT_ID");
	const clientSecret = yield* Config.redacted("TWITCH_CLIENT_SECRET");

	const channel = yield* Config.string("TWITCH_CHANNEL");
	const oauthRedirectUri = yield* Config.string(
		"TWITCH_OAUTH_REDIRECT_URI",
	).pipe(Config.withDefault("https://127.0.0.1:4399/oauth/twitch/callback"));

	const oauthTlsCertPath = yield* Config.string(
		"TWITCH_OAUTH_TLS_CERT_PATH",
	).pipe(Config.withDefault("./certs/cert.pem"));
	const oauthTlsKeyPath = yield* Config.string(
		"TWITCH_OAUTH_TLS_KEY_PATH",
	).pipe(Config.withDefault("./certs/key.pem"));

	return new TwitchConfig({
		clientId,
		clientSecret,
		channel,
		oauthRedirectUri,
		oauthTlsCertPath,
		oauthTlsKeyPath,
	});
});
