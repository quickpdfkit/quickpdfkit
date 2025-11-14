"use client";

import { useState, useRef } from "react";
import { PDFDocument } from "pdf-lib-plus-encrypt";
import { saveAs } from "file-saver";
import {
  Upload,
  Download,
  FileText,
  Lock,
  Eye,
  EyeOff,
  Shield,
  Key,
} from "lucide-react";

export default function PdfProtector() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [protecting, setProtecting] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [permissions, setPermissions] = useState({
    printing: true,
    copying: true,
    modifying: false,
    annotating: true,
  });
  const [protectionLevel, setProtectionLevel] = useState<
    "user" | "owner" | "both"
  >("both");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  const handleFileUpload = (file: File | null) => {
    if (!file || file.type !== "application/pdf") {
      showToast("Please upload a valid PDF file");
      return;
    }

    setPdfFile(file);
    showToast("PDF loaded successfully");
  };

  const validatePasswords = (): boolean => {
    if (!password) {
      showToast("Please enter a password");
      return false;
    }

    if (password.length < 6) {
      showToast("Password must be at least 6 characters");
      return false;
    }

    if (password !== confirmPassword) {
      showToast("Passwords do not match");
      return false;
    }

    return true;
  };

  const protectPdfWithPassword = async () => {
    if (!pdfFile) return;

    if (!validatePasswords()) return;

    setProtecting(true);
    setToastMsg("Encrypting PDF...");

    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      // ✅ REAL encryption logic
      pdfDoc.encrypt({
        // keyBits: 256,
        userPassword: password,
        ownerPassword: password,
        permissions: {
          printing: "highResolution",
          modifying: false,
          copying: false,
          annotating: false,
          fillingForms: false,
          contentAccessibility: false,
          documentAssembly: false,
        },
      });

      const pdfBytes = await pdfDoc.save({ useObjectStreams: false });
      // const blob = new Blob([pdfBytes], { type: "application/pdf" });
      // pdfBytes is Uint8Array<ArrayBufferLike>
      const safeBytes = new Uint8Array(pdfBytes); // new Uint8Array backed by ArrayBuffer
      const blob = new Blob([safeBytes], { type: "application/pdf" });

      saveAs(blob, `protected_${pdfFile.name}`);

      setProtecting(false);
      setPdfFile(null);
      setPassword("");
      setConfirmPassword("");
      setToastMsg("PDF encrypted successfully!");
    } catch (error) {
      console.error(error);
      setToastMsg("Encryption failed. Please try again.");
      setProtecting(false);
    }
  };



  const resetAll = () => {
    setPdfFile(null);
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setShowConfirmPassword(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-gray-50 flex flex-col items-center px-4 py-6 sm:py-10 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-100 rounded-full blur-3xl opacity-30" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-50 rounded-full blur-3xl opacity-40" />
      </div>

      <div className="w-full max-w-4xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 mb-4">
            <Lock className="w-8 h-8 text-orange-500" />
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-3 text-gray-900">
            Protect <span className="text-orange-500">PDF</span>
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Secure your PDF files with password protection
          </p>
        </div>

        {/* Upload Area */}
        {!pdfFile && (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files[0];
              handleFileUpload(file);
            }}
          >
            <label
              htmlFor="pdf-upload"
              className="w-full p-8 sm:p-12 flex flex-col items-center justify-center gap-3 border-2 border-dashed border-gray-300 rounded-2xl bg-white cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition-all duration-300 group"
            >
              <div className="p-4 rounded-full bg-orange-100 group-hover:bg-orange-200 transition-all duration-300">
                <Upload className="w-8 h-8 sm:w-10 sm:h-10 text-orange-500" />
              </div>
              <div className="text-center">
                <span className="text-gray-900 text-base sm:text-lg font-medium block">
                  Click to upload or drag & drop
                </span>
                <span className="text-gray-500 text-xs sm:text-sm mt-1 block">
                  PDF files only • Maximum file size: 100MB
                </span>
              </div>
              <input
                id="pdf-upload"
                type="file"
                accept=".pdf"
                className="hidden"
                ref={fileInputRef}
                onChange={(e) => handleFileUpload(e.target.files?.[0] || null)}
              />
            </label>
          </div>
        )}

        {/* PDF Loaded - Protection Options */}
        {pdfFile && (
          <div className="space-y-6">
            {/* File Info */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-orange-100">
                    <FileText className="w-6 h-6 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-gray-900 font-semibold">
                      {pdfFile.name}
                    </p>
                    <p className="text-gray-500 text-sm mt-1">
                      {formatFileSize(pdfFile.size)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={resetAll}
                  className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium transition-all"
                >
                  Change File
                </button>
              </div>
            </div>
            {/* Password Settings */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center gap-2 mb-6">
                <Key className="w-5 h-5 text-orange-500" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Password Settings
                </h3>
              </div>

              <div className="space-y-4">
                {/* Password Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password (min. 6 characters)"
                      className="w-full px-4 py-3 pr-12 rounded-xl bg-white text-gray-900 placeholder-gray-400 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-lg transition-all"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5 text-gray-400" />
                      ) : (
                        <Eye className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className="w-full px-4 py-3 pr-12 rounded-xl bg-white text-gray-900 placeholder-gray-400 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-lg transition-all"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5 text-gray-400" />
                      ) : (
                        <Eye className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Password Strength Indicator */}
                {password && (
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-600">Password Strength</span>
                      <span
                        className={`font-medium ${
                          password.length < 6
                            ? "text-red-600"
                            : password.length < 10
                            ? "text-yellow-600"
                            : "text-green-600"
                        }`}
                      >
                        {password.length < 6
                          ? "Weak"
                          : password.length < 10
                          ? "Medium"
                          : "Strong"}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          password.length < 6
                            ? "bg-red-500 w-1/3"
                            : password.length < 10
                            ? "bg-yellow-500 w-2/3"
                            : "bg-green-500 w-full"
                        }`}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Protection Level */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-orange-500" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Protection Level
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={() => setProtectionLevel("user")}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    protectionLevel === "user"
                      ? "border-orange-500 bg-orange-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <p className="text-gray-900 font-semibold mb-1">
                    User Password Only
                  </p>
                  <p className="text-sm text-gray-600">
                    Requires password to open the PDF
                  </p>
                </button>

                <button
                  onClick={() => setProtectionLevel("owner")}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    protectionLevel === "owner"
                      ? "border-orange-500 bg-orange-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <p className="text-gray-900 font-semibold mb-1">
                    Owner Password Only
                  </p>
                  <p className="text-sm text-gray-600">
                    Restricts editing and printing permissions
                  </p>
                </button>

                <button
                  onClick={() => setProtectionLevel("both")}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    protectionLevel === "both"
                      ? "border-orange-500 bg-orange-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <p className="text-gray-900 font-semibold mb-1">
                    Full Protection (Recommended)
                  </p>
                  <p className="text-sm text-gray-600">
                    Requires password to open and restricts permissions
                  </p>
                </button>
              </div>
            </div>

            {/* Permissions */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Document Permissions
              </h3>

              <div className="space-y-3">
                {[
                  {
                    key: "printing",
                    label: "Allow Printing",
                    description: "Users can print the document",
                  },
                  {
                    key: "copying",
                    label: "Allow Copying Text",
                    description: "Users can copy text and images",
                  },
                  {
                    key: "modifying",
                    label: "Allow Modifying",
                    description: "Users can edit the document",
                  },
                  {
                    key: "annotating",
                    label: "Allow Annotations",
                    description: "Users can add comments and annotations",
                  },
                ].map((permission) => (
                  <label
                    key={permission.key}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-all"
                  >
                    <input
                      type="checkbox"
                      checked={
                        permissions[permission.key as keyof typeof permissions]
                      }
                      onChange={(e) =>
                        setPermissions((prev) => ({
                          ...prev,
                          [permission.key]: e.target.checked,
                        }))
                      }
                      className="mt-0.5 w-5 h-5 text-orange-500 border-gray-300 rounded focus:ring-orange-400"
                    />
                    <div className="flex-1">
                      <p className="text-gray-900 font-medium">
                        {permission.label}
                      </p>
                      <p className="text-sm text-gray-600">
                        {permission.description}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={resetAll}
                disabled={protecting}
                className="flex-1 sm:flex-none px-6 py-3 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium transition-all hover:shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>

              <button
                onClick={protectPdfWithPassword}
                disabled={
                  protecting || !password || password !== confirmPassword
                }
                className="flex-1 px-8 py-3 rounded-xl font-semibold text-white bg-orange-500 hover:bg-orange-600 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 active:scale-95 flex items-center justify-center gap-2"
              >
                {protecting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Protecting...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    Protect & Download
                  </>
                )}
              </button>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 font-bold">i</span>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-blue-900 font-medium mb-1">
                    Security Information
                  </p>
                  <p className="text-sm text-blue-700">
                    For enterprise-grade encryption, we recommend using
                    server-side tools with AES-256 encryption. This browser tool
                    provides basic password marking suitable for casual use.
                    Your PDF files are processed locally and never uploaded to
                    any server.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white border border-gray-200 text-gray-900 px-6 py-3 rounded-xl shadow-2xl text-sm font-medium z-50 animate-slideUp">
          {toastMsg}
        </div>
      )}

      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translate(-50%, 20px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}

// "use client";

// import { useState } from "react";
// import { PDFDocument } from "pdf-lib-plus-encrypt";
// import { saveAs } from "file-saver";

// export default function ProtectPdfPage() {
//   const [file, setFile] = useState<File | null>(null);
//   const [password, setPassword] = useState("");
//   const [repeatPassword, setRepeatPassword] = useState("");
//   const [error, setError] = useState<string | null>(null);
//   const [loading, setLoading] = useState(false);

//   const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setError(null);
//     if (e.target.files && e.target.files[0]) {
//       setFile(e.target.files[0]);
//     }
//   };

//   const onSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError(null);

//     if (!file) {
//       setError("Please select a PDF file.");
//       return;
//     }
//     if (!password) {
//       setError("Please enter a password.");
//       return;
//     }
//     if (password !== repeatPassword) {
//       setError("Passwords do not match.");
//       return;
//     }

//     try {
//       setLoading(true);

//       const arrayBuffer = await file.arrayBuffer();
//       const pdfDoc = await PDFDocument.load(arrayBuffer);

//       // Use the encryption API of pdf‑lib‑plus‑encrypt
//       pdfDoc.encrypt({
//         keyBits: 256,
//         userPassword: password,
//         ownerPassword: password,
//         permissions: {
//           printing: "highResolution",
//           modifying: false,
//           copying: false,
//           annotating: false,
//           fillingForms: false,
//           contentAccessibility: false,
//           documentAssembly: false,
//         },
//       });

//       const pdfBytes = await pdfDoc.save({ useObjectStreams: false });
//       const blob = new Blob([pdfBytes], { type: "application/pdf" });
//       saveAs(blob, `protected_${file.name}`);

//       setLoading(false);
//       setFile(null);
//       setPassword("");
//       setRepeatPassword("");
//       setError(null);
//     } catch (err) {
//       console.error(err);
//       setError("Encryption failed. Please try another file.");
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] p-4">
//       <div className="bg-black/50 backdrop-blur-md rounded-2xl p-8 w-full max-w-md flex flex-col gap-6">
//         <h1 className="text-3xl font-bold text-white text-center">🔒 Secure Your PDF</h1>

//         <input
//           type="file"
//           accept="application/pdf"
//           onChange={onFileChange}
//           className="block w-full text-white"
//         />
//         {file && <p className="text-white/70">Selected file: {file.name}</p>}

//         <input
//           type="password"
//           placeholder="Enter password"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//           className="w-full px-4 py-2 rounded bg-black/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-cyan-400"
//         />
//         <input
//           type="password"
//           placeholder="Repeat password"
//           value={repeatPassword}
//           onChange={(e) => setRepeatPassword(e.target.value)}
//           className="w-full px-4 py-2 rounded bg-black/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-cyan-400"
//         />

//         {error && <p className="text-red-500">{error}</p>}

//         <button
//           onClick={onSubmit}
//           disabled={loading}
//           className={`w-full py-3 rounded bg-cyan-500 hover:bg-cyan-400 text-black font-semibold transition-colors ${
//             loading ? "opacity-50 cursor-not-allowed" : ""
//           }`}
//         >
//           {loading ? "Encrypting…" : "Encrypt PDF"}
//         </button>
//       </div>
//     </div>
//   );
// }
