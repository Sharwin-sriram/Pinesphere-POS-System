type Props = {
  title: string;
  value: string;
};

export default function StatsCard({ title, value }: Props) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm">
      <p className="text-gray-500 text-sm">{title}</p>

      <h2 className="text-3xl font-bold mt-3 text-gray-800">
        {value}
      </h2>
    </div>
  );
}