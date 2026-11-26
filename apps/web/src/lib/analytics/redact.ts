// Query params that carry one-time secrets (reset-password and verify-email links, OAuth codes).
const SECRET_PARAMS = ["token", "code"];
const SECRET_PARAM_PATTERN = new RegExp(`([?&](?:${SECRET_PARAMS.join("|")})=)[^&#\\s"]*`, "gi");

export const REDACTED = "REDACTED";

export function redactUrl(value: string): string {
  return value.replace(SECRET_PARAM_PATTERN, `$1${REDACTED}`);
}

type Props = Record<string, unknown> | undefined;

function redactProps(props: Props): Props {
  if (!props) return props;
  return Object.fromEntries(
    Object.entries(props).map(([key, value]) => [key, typeof value === "string" ? redactUrl(value) : value])
  );
}

type CaptureLike = {
  properties?: Record<string, unknown>;
  $set?: Record<string, unknown>;
  $set_once?: Record<string, unknown>;
};

/** Returns a copy of the event with secret query params removed from every string property. */
export function redactEvent<T extends CaptureLike>(event: T): T {
  return {
    ...event,
    properties: redactProps(event.properties),
    $set: redactProps(event.$set),
    $set_once: redactProps(event.$set_once),
  };
}
