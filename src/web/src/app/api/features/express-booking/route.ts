import {
  FeatureFlagEvaluationError,
  getExpressBookingState,
} from "@/featureManagement/expressBooking";

export const dynamic = "force-dynamic";

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, max-age=0",
};

export async function GET() {
  try {
    const state = await getExpressBookingState();
    return Response.json(state === "enabled", { headers: NO_STORE_HEADERS });
  } catch (error) {
    if (error instanceof FeatureFlagEvaluationError) {
      const guidance =
        error.kind === "authentication"
          ? "Run az login for the required tenant."
          : error.kind === "authorization"
            ? "Grant the Azure CLI identity App Configuration Data Reader access."
            : error.kind === "connectivity"
              ? "Verify AZURE_APPCONFIG_ENDPOINT and network access to the store."
              : "The Azure App Configuration provider failed while loading configuration.";
      console.error(
        `[Azure App Configuration] ExpressBooking ${error.kind} failure (${error.causeType}). ${guidance}`
      );
    } else {
      console.error(
        "[Azure App Configuration] ExpressBooking failed with an unexpected server error."
      );
    }

    return Response.json(false, {
      status: 503,
      headers: NO_STORE_HEADERS,
    });
  }
}
