// "use client";

// import { motion } from "framer-motion";
// import { FileText, Sparkles, Zap, Shield } from "lucide-react";
// import Link from "next/link";

// export default function Hero() {
//   const features = [
//     { icon: Zap, text: "Lightning Fast" },
//     { icon: Shield, text: "100% Secure" },
//     { icon: Sparkles, text: "Free Forever" },
//   ];

//   return (
//     <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 pt-20">
//       {/* Animated Background */}
//       <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black">
//         {/* Grid Pattern */}
//         <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.05)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />

//         {/* Floating Orbs */}
//         {[...Array(3)].map((_, i) => (
//           <motion.div
//             key={i}
//             className="absolute w-96 h-96 rounded-full blur-3xl"
//             style={{
//               background: `radial-gradient(circle, ${
//                 i === 0
//                   ? "rgba(6,182,212,0.15)"
//                   : i === 1
//                   ? "rgba(139,92,246,0.15)"
//                   : "rgba(236,72,153,0.15)"
//               }, transparent)`,
//               left: `${20 + i * 30}%`,
//               top: `${20 + i * 20}%`,
//             }}
//             animate={{
//               x: [0, 100, 0],
//               y: [0, -100, 0],
//               scale: [1, 1.2, 1],
//             }}
//             transition={{
//               duration: 20 + i * 5,
//               repeat: Infinity,
//               ease: "linear",
//             }}
//           />
//         ))}
//       </div>

//       <div className="relative z-10 max-w-6xl mx-auto text-center">
//         {/* Badge */}
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.6 }}
//           className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-full mb-8 backdrop-blur-xl"
//         >
//           <Sparkles className="w-4 h-4 text-cyan-400" />
//           <span className="text-sm text-cyan-400 font-medium">
//             Free Online PDF Tools
//           </span>
//         </motion.div>

//         {/* Main Heading */}
//         <motion.h1
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.6, delay: 0.1 }}
//           className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6"
//         >
//           <span className="bg-gradient-to-r from-white via-cyan-200 to-white bg-clip-text text-transparent">
//             Transform Your PDFs
//           </span>
//           <br />
//           <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 bg-clip-text text-transparent">
//             In Seconds
//           </span>
//         </motion.h1>

//         {/* Subheading */}
//         <motion.p
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.6, delay: 0.2 }}
//           className="text-lg sm:text-xl text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed"
//         >
//           Merge, split, compress, and convert your PDF files with our powerful
//           suite of tools. No registration required, completely free.
//         </motion.p>

//         {/* Features */}
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.6, delay: 0.3 }}
//           className="flex flex-wrap items-center justify-center gap-6 mb-12"
//         >
//           {features.map((feature, index) => (
//             <motion.div
//               key={index}
//               whileHover={{ scale: 1.05 }}
//               className="flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-xl border border-gray-800/50 rounded-lg"
//             >
//               <feature.icon className="w-5 h-5 text-cyan-400" />
//               <span className="text-sm text-gray-300 font-medium">
//                 {feature.text}
//               </span>
//             </motion.div>
//           ))}
//         </motion.div>

//         {/* CTA Buttons */}
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.6, delay: 0.4 }}
//           className="flex flex-col sm:flex-row items-center justify-center gap-4"
//         >
//           <Link href="/tools">
//             <motion.button
//               whileHover={{ scale: 1.05 }}
//               whileTap={{ scale: 0.95 }}
//               className="relative px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-semibold text-lg shadow-[0_0_40px_rgba(6,182,212,0.4)] hover:shadow-[0_0_60px_rgba(6,182,212,0.6)] transition-all duration-300 group overflow-hidden"
//             >
//               <span className="relative z-10 flex items-center gap-2">
//                 <FileText className="w-5 h-5" />
//                 Explore Tools
//               </span>
//               <motion.div
//                 className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-400"
//                 initial={{ x: "-100%" }}
//                 whileHover={{ x: 0 }}
//                 transition={{ duration: 0.3 }}
//               />
//             </motion.button>
//           </Link>

//           <Link href="#features">
//             <motion.button
//               whileHover={{ scale: 1.05 }}
//               whileTap={{ scale: 0.95 }}
//               className="px-8 py-4 bg-white/5 backdrop-blur-xl border border-gray-700/50 hover:border-cyan-500/50 text-white rounded-xl font-semibold text-lg transition-all duration-300"
//             >
//               Learn More
//             </motion.button>
//           </Link>
//         </motion.div>

//         {/* Stats */}
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.6, delay: 0.5 }}
//           className="mt-20 grid grid-cols-2 sm:grid-cols-3 gap-8 max-w-3xl mx-auto"
//         >
//           {[
//             { label: "Tools Available", value: "15+" },
//             { label: "Files Processed", value: "1M+" },
//             { label: "Happy Users", value: "500K+" },
//           ].map((stat, index) => (
//             <div
//               key={index}
//               className="p-6 bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-xl border border-gray-800/50 rounded-xl"
//             >
//               <motion.div
//                 initial={{ scale: 0 }}
//                 animate={{ scale: 1 }}
//                 transition={{ delay: 0.6 + index * 0.1, type: "spring" }}
//                 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2"
//               >
//                 {stat.value}
//               </motion.div>
//               <div className="text-sm text-gray-400">{stat.label}</div>
//             </div>
//           ))}
//         </motion.div>
//       </div>

//       {/* Scroll Indicator */}
//       <motion.div
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         transition={{ delay: 1, duration: 1 }}
//         className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
//       >
//         <motion.div
//           animate={{ y: [0, 10, 0] }}
//           transition={{ duration: 1.5, repeat: Infinity }}
//           className="flex flex-col items-center gap-2 text-gray-500"
//         >
//           <span className="text-sm">Scroll to explore</span>
//           <svg
//             className="w-6 h-6"
//             fill="none"
//             stroke="currentColor"
//             viewBox="0 0 24 24"
//           >
//             <path
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               strokeWidth={2}
//               d="M19 14l-7 7m0 0l-7-7m7 7V3"
//             />
//           </svg>
//         </motion.div>
//       </motion.div>
//     </section>
//   );
// }


"use client";

import { FileText, Sparkles, Zap, Shield } from "lucide-react";
import Link from "next/link";

export default function Hero() {
  const features = [
    { icon: Zap, text: "Lightning Fast" },
    { icon: Shield, text: "100% Secure" },
    { icon: Sparkles, text: "Free Forever" },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 pt-20 bg-gradient-to-br from-orange-50 via-white to-gray-50">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(251,146,60,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(251,146,60,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-orange-200 rounded-full mb-8 shadow-sm">
          <Sparkles className="w-4 h-4 text-orange-500" />
          <span className="text-sm text-orange-600 font-medium">
            Free Online PDF Tools
          </span>
        </div>

        {/* Main Heading */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 text-gray-900">
          Transform Your PDFs
          <br />
          <span className="text-orange-500">In Seconds</span>
        </h1>

        {/* Subheading */}
        <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
          Merge, split, compress, and convert your PDF files with our powerful
          suite of tools. No registration required, completely free.
        </p>

        {/* Features */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md hover:border-orange-300 transition-all"
            >
              <feature.icon className="w-5 h-5 text-orange-500" />
              <span className="text-sm text-gray-700 font-medium">
                {feature.text}
              </span>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/tools">
            <button className="px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Explore Tools
            </button>
          </Link>

          <Link href="#features">
            <button className="px-8 py-4 bg-white hover:bg-gray-50 border border-gray-300 hover:border-orange-400 text-gray-700 rounded-xl font-semibold text-lg shadow-sm hover:shadow-md transition-all duration-300">
              Learn More
            </button>
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-2 sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
          {[
            { label: "Tools Available", value: "15+" },
            { label: "Files Processed", value: "1M+" },
            { label: "Happy Users", value: "500K+" },
          ].map((stat, index) => (
            <div
              key={index}
              className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="text-3xl sm:text-4xl font-bold text-orange-500 mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2">
        <div className="flex flex-col items-center gap-2 text-gray-400">
          <span className="text-sm">Scroll to explore</span>
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </div>
    </section>
  );
}