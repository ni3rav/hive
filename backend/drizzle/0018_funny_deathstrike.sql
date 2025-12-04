CREATE TABLE "email_rate_limits" (
	"identifier" text NOT NULL,
	"type" text NOT NULL,
	"last_sent_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "email_rate_limits_identifier_type_pk" PRIMARY KEY("identifier","type")
);
