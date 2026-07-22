import { students } from "@/data/leaderboard";

export default function Leaderboard() {
  return (
    <div className="rounded-xl border p-6">
      <h2 className="text-2xl font-bold mb-4">
        Leaderboard
      </h2>

      {students.map((student) => (
        <div
          key={student.rank}
          className="flex justify-between border-b py-3"
        >
          <span>
            #{student.rank} {student.name}
          </span>

          <span>{student.points} pts</span>
        </div>
      ))}
    </div>
  );
}