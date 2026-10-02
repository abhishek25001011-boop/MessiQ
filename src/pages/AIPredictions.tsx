import { prediction } from "@/data/Predictions";

export default function AIPredictions() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">
        AI Predictions
      </h1>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-xl border p-6">
          <h2 className="font-semibold">
            Students Today
          </h2>

          <p className="text-3xl mt-2">
            {prediction.students}
          </p>
        </div>

        <div className="rounded-xl border p-6">
          <h2 className="font-semibold">
            Expected Waste
          </h2>

          <p className="text-3xl mt-2">
            {prediction.waste}
          </p>
        </div>

        <div className="rounded-xl border p-6">
          <h2 className="font-semibold">
            Peak Hour
          </h2>

          <p className="text-3xl mt-2">
            {prediction.peakHour}
          </p>
        </div>

        <div className="rounded-xl border p-6">
          <h2 className="font-semibold">
            Expected Revenue
          </h2>

          <p className="text-3xl mt-2">
            {prediction.revenue}
          </p>
        </div>
      </div>
    </div>
  );
}
