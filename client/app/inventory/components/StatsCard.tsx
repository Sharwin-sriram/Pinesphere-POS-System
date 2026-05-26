type Props = {
 title: string;
 value: string;
};

export default function StatsCard({ title, value }: Props) {
 return (
 <div className="bg-white rounded-2xl p-5 ">
 <p className="text-gray-500 text-sm">{title}</p>

 <h2 className="text-3xl font-semibold mt-3 text-[var(--color-text-primary)]">
 {value}
 </h2>
 </div>
 );
}