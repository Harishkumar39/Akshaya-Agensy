import PolicyLayout from "../../components/PolicyLayout";

export default function CancellationRefund() {
  const rules = [
    { title: "Cancellations", content: "Orders can be cancelled within 2 hours of placement, provided they have not yet been processed for dispatch." },
    { title: "No Returns", content: "Due to the nature of stationery products, all sales are final. We do not accept returns or exchanges once items have been delivered." },
    { title: "Damaged Items", content: "If you receive the wrong or damaged product, please contact us within 24 hours with unboxing photos for a resolution." },
    { title: "Refund Processing", content: "Refunds for valid cancellations are processed back to your original payment method within 5-10 business days." }
  ];

  return (
    <PolicyLayout title="Cancellation & Refunds">
      <div className="space-y-8">
        {rules.map((r, idx) => (
          <div key={idx} className="flex gap-4">
            <span className="bg-amber-100 text-amber-600 font-bold w-8 h-8 rounded-full flex items-center justify-center shrink-0">
              {idx + 1}
            </span>
            <p><strong>{r.title}:</strong> {r.content}</p>
          </div>
        ))}
      </div>
    </PolicyLayout>
  );
}