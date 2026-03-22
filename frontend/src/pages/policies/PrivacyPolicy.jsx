import PolicyLayout from "../../components/PolicyLayout";

export default function PrivacyPolicy() {
  const policies = [
    {
      title: "Information Collection",
      content: "We collect your name, email, phone number, and delivery address to process orders and provide secure OTP verification."
    },
    {
      title: "Cookies & Security",
      content: "We use httpOnly cookies for secure authentication. These are protected from cross-site scripting (XSS) and do not track your activity on third-party sites."
    },
    {
      title: "Data Usage",
      content: "Your data is used strictly for order fulfillment, account management, and critical service updates regarding your stationery orders."
    },
    {
      title: "Third Parties",
      content: "We do not sell your data. We only share necessary info (like your address) with our verified delivery partners to get your products to you."
    }
  ];

  return (
    <PolicyLayout title="Privacy Policy" lastUpdated="March 21, 2026">
      <div className="space-y-8">
        {policies.map((p, idx) => (
          <div key={idx} className="flex gap-4">
            <span className="bg-amber-100 text-amber-600 font-bold w-8 h-8 rounded-full flex items-center justify-center shrink-0">
              {idx + 1}
            </span>
            <div>
              <p><strong>{p.title}:</strong> {p.content}</p>
            </div>
          </div>
        ))}
      </div>
    </PolicyLayout>
  );
}