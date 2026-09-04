import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-[#1A1F2E] flex items-center justify-center p-4">
      <SignIn 
        routing="path"
        path="/sign-in"
        appearance={{
          elements: {
            rootBox: "w-full max-w-md",
            card: "bg-[#0F1318] border border-[#C9A84C]/30 rounded-xl shadow-2xl p-6",
            headerTitle: "text-[#C9A84C] font-playfair text-2xl",
            headerSubtitle: "text-[#E8D5A3] text-sm",
            formFieldLabel: "text-white text-sm",
            formFieldInput: "bg-[#1A1F2E] border-[#C9A84C]/30 text-white rounded-lg focus:border-[#C9A84C] focus:ring-[#C9A84C]",
            formButtonPrimary: "bg-[#C9A84C] text-[#1A1F2E] hover:bg-[#E8D5A3] transition font-medium rounded-lg py-2",
            footerActionLink: "text-[#C9A84C] hover:text-[#E8D5A3] transition",
            socialButtonsBlockButton: "border-[#C9A84C]/30 text-white hover:bg-[#C9A84C]/10 rounded-lg",
            dividerLine: "bg-[#C9A84C]/30",
            dividerText: "text-gray-500 text-xs",
          }
        }}
      />
    </div>
  );
}