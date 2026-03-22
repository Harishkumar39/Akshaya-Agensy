import PolicyLayout from "../../components/PolicyLayout";

export default function DeliveryPolicy() {
  const points = [
    { title: "Processing Time", content: "Orders are typically processed within 1-2 business days." },
    { title: "Local Delivery", content: "Local deliveries are usually completed within 2-3 business days once dispatched." },
    { title: "Shipping Charges", content: "Charges are calculated at checkout based on the delivery distance and order volume." },
    { title: "Tracking", content: "Once your order is dispatched, you will receive a notification and updates via your email and 'My Orders' dashboard." }
  ];

  return (
    <PolicyLayout title="Delivery Policy">
      <div className="space-y-8">
        {points.map((p, idx) => (
          <div key={idx} className="flex gap-4">
            <span className="bg-amber-100 text-amber-600 font-bold w-8 h-8 rounded-full flex items-center justify-center shrink-0">
              {idx + 1}
            </span>
            <p><strong>{p.title}:</strong> {p.content}</p>
          </div>
        ))}
      </div>
    </PolicyLayout>
  );
}