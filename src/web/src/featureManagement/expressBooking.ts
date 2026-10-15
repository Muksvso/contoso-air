import "server-only";

import { load } from "@azure/app-configuration-provider";
import { AzureCliCredential } from "@azure/identity";
import {
  ConfigurationMapFeatureFlagProvider,
  FeatureManager,
} from "@microsoft/feature-management";

const EXPRESS_BOOKING_FLAG = "kvBeta";

export type ExpressBookingState = "missing" | "disabled" | "enabled";
export type FeatureFlagErrorKind =
  | "authentication"
  | "authorization"
  | "connectivity"
  | "provider";

export class FeatureFlagEvaluationError extends Error {
  constructor(
    public readonly kind: FeatureFlagErrorKind,
    public readonly causeType: string,
    options: ErrorOptions
  ) {
    super(`Azure App Configuration ${kind} failure.`, options);
    this.name = "FeatureFlagEvaluationError";
  }
}

function getErrorChain(error: unknown): unknown[] {
  const errors: unknown[] = [];
  let current = error;

  while (current && !errors.includes(current)) {
    errors.push(current);
    current =
      current instanceof Error && "cause" in current
        ? current.cause
        : undefined;
  }

  return errors;
}

function classifyError(error: unknown): FeatureFlagEvaluationError {
  const errors = getErrorChain(error);
  const statusCode = errors
    .map((item) => {
      if (typeof item !== "object" || item === null) return undefined;
      const status = Reflect.get(item, "statusCode");
      return typeof status === "number" ? status : undefined;
    })
    .find((status) => status !== undefined);
  const causeType =
    errors
      .map((item) => (item instanceof Error ? item.name : undefined))
      .find((name) => name && name !== "Error") ?? "UnknownError";
  const errorCode = errors
    .map((item) => {
      if (typeof item !== "object" || item === null) return undefined;
      const code = Reflect.get(item, "code");
      return typeof code === "string" ? code : undefined;
    })
    .find((code) => code !== undefined);

  if (statusCode === 403) {
    return new FeatureFlagEvaluationError(
      "authorization",
      causeType,
      { cause: error }
    );
  }

  if (
    statusCode === 401 ||
    errors.some(
      (item) =>
        item instanceof Error &&
        (item.name.includes("Credential") ||
          item.name.includes("Authentication"))
    )
  ) {
    return new FeatureFlagEvaluationError(
      "authentication",
      causeType,
      { cause: error }
    );
  }

  if (
    statusCode === 408 ||
    statusCode === 429 ||
    (statusCode !== undefined && statusCode >= 500) ||
    ["ENOTFOUND", "ECONNREFUSED", "ECONNRESET", "ETIMEDOUT"].includes(
      errorCode ?? ""
    )
  ) {
    return new FeatureFlagEvaluationError(
      "connectivity",
      causeType,
      { cause: error }
    );
  }

  return new FeatureFlagEvaluationError(
    "provider",
    causeType,
    { cause: error }
  );
}

function getEndpoint(): URL {
  const endpoint = process.env.AZURE_APPCONFIG_ENDPOINT?.trim();

  if (!endpoint) {
    throw new FeatureFlagEvaluationError(
      "connectivity",
      "MissingEndpointError",
      { cause: new Error("AZURE_APPCONFIG_ENDPOINT is not configured.") }
    );
  }

  try {
    const url = new URL(endpoint);
    if (url.protocol !== "https:") throw new TypeError();
    return url;
  } catch (error) {
    throw new FeatureFlagEvaluationError(
      "connectivity",
      "InvalidEndpointError",
      { cause: error }
    );
  }
}

export async function getExpressBookingState(): Promise<ExpressBookingState> {
  console.log("Attempting to load configuration.");
  try {
    const endpoint = getEndpoint();
    const credential = new AzureCliCredential();
    const appConfig = await load(endpoint, credential, {
      featureFlagOptions: {
        enabled: true,
      },
    });
    const featureProvider = new ConfigurationMapFeatureFlagProvider(appConfig);
    const feature = await featureProvider.getFeatureFlag(
      EXPRESS_BOOKING_FLAG
    );

    if (!feature) return "missing";

    const featureManager = new FeatureManager(featureProvider);
    return (await featureManager.isEnabled(EXPRESS_BOOKING_FLAG))
      ? "enabled"
      : "disabled";
  } catch (error) {
    console.error(error);
    if (error instanceof FeatureFlagEvaluationError) throw error;
    throw classifyError(error);
  }
}
