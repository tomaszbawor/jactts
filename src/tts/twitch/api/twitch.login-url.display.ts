import { Url, UrlParams } from "@effect/platform";
import { Effect, Either, pipe, Redacted } from "effect";
import { loadTwitchConfig, TWITCH_OAUTH_AUTHORIZE_URL } from "./twich.config";

export const openTwichAuthorization = Effect.gen(function* () {
	const config = yield* loadTwitchConfig;

	const authParams = pipe(
		UrlParams.empty,
		UrlParams.append("client_id", Redacted.value(config.clientId)),
		UrlParams.append("redirect_uri", config.oauthRedirectUri),
		UrlParams.append("response_type", "code"),
		UrlParams.append("scope", "user:bot"), // TODO: Add to config
	);

	const urlBaseEither = Url.fromString(TWITCH_OAUTH_AUTHORIZE_URL);

	if (Either.isRight(urlBaseEither)) {
		const url = pipe(urlBaseEither.right, Url.setUrlParams(authParams));

		//TODO: Open browser with url
		yield* Effect.logInfo("URL:", url.href);
	}
});
