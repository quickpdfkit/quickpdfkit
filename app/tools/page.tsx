import Link from "next/link";

export default function ToolsList() {
  return (
    <ul>
      <li><Link href="/tools/add-blank-pages">Add Blank Pages</Link></li>
      <li><Link href="/tools/merge-pdf">Merge PDF</Link></li>
      <li><Link href="/tools/split-pdf">Split PDF</Link></li>
      <li><Link href="/tools/compress-pdf">Compress PDF</Link></li>
    </ul>
  );
}
