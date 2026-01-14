import { Url, UrlParams } from "@effect/platform";
import { Effect, Either, pipe, Redacted } from "effect";
import { loadTwitchConfig } from "./twich.config";

export const TWITCH_OAUTH_TOKEN_URL = "https://id.twitch.tv/oauth2/token";
export const TWITCH_OAUTH_AUTHORIZE_URL =
	"https://id.twitch.tv/oauth2/authorize";

export const openTwichAuthorization = Effect.gen(function* () {
	// const client = yield* HttpClient;
	const config = yield* loadTwitchConfig;

	const authParams = pipe(
		UrlParams.empty,
		UrlParams.append("client_id", Redacted.value(config.clientId)),
		UrlParams.append("redirect_uri", config.oauthRedirectUri),
		UrlParams.append("response_type", "token"),
		UrlParams.append("scope", "user:bot"),
	);

	const urlBaseEither = Url.fromString(TWITCH_OAUTH_AUTHORIZE_URL);

	if (Either.isRight(urlBaseEither)) {
		const url = pipe(urlBaseEither.right, Url.setUrlParams(authParams));

		//TODO: Open browser with url
		yield* Effect.logInfo("URL:", url.href);
	}
});
