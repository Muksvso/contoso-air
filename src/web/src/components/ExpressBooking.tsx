"use client";

import { Flight } from "@/types/flight";

interface ExpressBookingProps {
  outbound: Flight[];
  inbound: Flight[];
  onSelectOutbound: (flight: Flight) => void;
  onSelectInbound: (flight: Flight | null) => void;
}

const getRecommendedFlight = (flights: Flight[]) =>
  flights.find((flight) => flight.stops === 0) ?? flights[0];

const ExpressBooking = ({
  outbound,
  inbound,
  onSelectOutbound,
  onSelectInbound,
}: ExpressBookingProps) => {
  const recommendedOutbound = getRecommendedFlight(outbound);
  const recommendedInbound = getRecommendedFlight(inbound);
  const canSelectRecommendation =
    Boolean(recommendedOutbound) &&
    (inbound.length === 0 || Boolean(recommendedInbound));

  return (
    <div className="overflow-hidden rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 via-white to-sky-50 shadow-sm">
      <div className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-gray-900">
              Express Booking
            </h2>
            <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-bold tracking-wide text-white">
              NEW
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-600">
            Short on time? Select recommended flights in one click.
          </p>
        </div>
        <button
          type="button"
          disabled={!canSelectRecommendation}
          onClick={() => {
            if (!recommendedOutbound) return;
            onSelectOutbound(recommendedOutbound);
            onSelectInbound(recommendedInbound ?? null);
          }}
          className="shrink-0 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
        >
          Select Recommended Flights
        </button>
      </div>
    </div>
  );
};

export default ExpressBooking;
