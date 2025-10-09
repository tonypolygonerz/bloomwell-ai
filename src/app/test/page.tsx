export default function TestPage() {
  return (
    <html>
      <head>
        <title>Test Page</title>
      </head>
      <body>
        <h1>Hello World - Test Page</h1>
        <p>If you can see this, the Next.js server is working!</p>
        <p>Current time: {new Date().toISOString()}</p>
      </body>
    </html>
  );
}
