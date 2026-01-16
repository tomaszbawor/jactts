import { Schema } from "effect";

export const SessionWelcomeSchema = Schema.Struct({
	metadata: Schema.Struct({
		message_id: Schema.String,
		message_type: Schema.Literal("session_welcome"),
		message_timestamp: Schema.DateTimeUtc,
	}),

	payload: Schema.Struct({
		session: Schema.Struct({
			id: Schema.String,
			status: Schema.String,
			connected_at: Schema.DateTimeUtc,
			keepalive_timeout_seconds: Schema.Number,
			reconnect_url: Schema.NullOr(Schema.String),
			recovery_url: Schema.NullOr(Schema.String),
		}),
	}),
});

export const KeepAliveSchema = Schema.Struct({
	metadata: Schema.Struct({
		message_id: Schema.String,
		message_type: Schema.Literal("session_keepalive"),
		message_timestamp: Schema.DateTimeUtc,
	}),
	payload: Schema.Struct({}),
});

export const TwitchWebSocketMessage = Schema.Union(
	SessionWelcomeSchema,
	KeepAliveSchema,
);

// type SessionWelcome = typeof SessionWelcomeSchema.Type;
