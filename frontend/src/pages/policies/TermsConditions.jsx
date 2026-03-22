import PolicyLayout from "../../components/PolicyLayout";

export default function TermsConditions() {
  return (
    <PolicyLayout title="Terms & Conditions">
      <div className="space-y-8">
        <div className="flex gap-4">
          <span className="bg-amber-100 text-amber-600 font-bold w-8 h-8 rounded-full flex items-center justify-center shrink-0">1</span>
          <p><strong>Account Accuracy:</strong> You are responsible for maintaining the confidentiality of your account and ensuring your contact details are correct.</p>
        </div>
        <div className="flex gap-4">
          <span className="bg-amber-100 text-amber-600 font-bold w-8 h-8 rounded-full flex items-center justify-center shrink-0">2</span>
          <p><strong>Wholesale Use:</strong> Akshaya Agency provides premium supplies; redistribution of our items must follow local trade laws.</p>
        </div>
        <div className="flex gap-4">
          <span className="bg-amber-100 text-amber-600 font-bold w-8 h-8 rounded-full flex items-center justify-center shrink-0">3</span>
          <p><strong>Ordering:</strong> All orders are subject to stock availability. We reserve the right to cancel orders in case of pricing errors.</p>
        </div>
        <div className="flex gap-4">
          <span className="bg-amber-100 text-amber-600 font-bold w-8 h-8 rounded-full flex items-center justify-center shrink-0">3</span>
          <p><strong>Termination:</strong> We reserve the right to suspend accounts engaging in fraudulent activity or OTP misuse.</p>
        </div>
      </div>
    </PolicyLayout>
  );
}