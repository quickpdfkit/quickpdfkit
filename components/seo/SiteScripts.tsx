import Script from "next/script";

export default function SiteScripts() {
  return (
    <>
      <Script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4916350136769682"
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />

      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-FBM4Q0Q5XM"
        strategy="afterInteractive"
      />

      <Script id="google-analytics" strategy="afterInteractive">
        {`
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-FBM4Q0Q5XM');
  `}
      </Script>
    </>
  );
}
