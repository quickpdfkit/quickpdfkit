import { ReactNode } from "react";
import Footer from "./Footer";
import Header from "./Header";

interface ToolPageWrapperProps {
  icon?: ReactNode;
  gradient?: string;
  children: ReactNode;
  supplementary?: ReactNode;
}

export default function ToolPageWrapper({
  icon,
  gradient = "from-orange-400 to-orange-500",
  children,
  supplementary,
}: ToolPageWrapperProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-gray-50">
      <Header />

      <section className="relative px-4 overflow-hidden">
        <div className="relative z-10 max-w-4xl mx-auto text-center pt-20">
          {icon && (
            <div className="inline-flex mb-6">
              <div
                className={`p-6 rounded-2xl bg-gradient-to-br ${gradient} shadow-lg`}
              >
                <div className="w-12 h-12 text-white">{icon}</div>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="relative py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="relative">
            <div className="relative bg-white border border-gray-200 rounded-3xl overflow-hidden sm:p-12 shadow-xl">
              <div className="relative z-10">{children}</div>
            </div>

            <div className="absolute -top-4 -right-4 w-24 h-24 bg-orange-100 rounded-full blur-2xl -z-10" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-orange-50 rounded-full blur-2xl -z-10" />
          </div>
        </div>
      </section>

      {supplementary}

      <Footer />
    </div>
  );
}
