"use client";
import React from "react";

export default function TermsPage() {
  return (
    <main className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-semibold mb-4">Terms of Service</h1>

      <p className="mb-4 text-muted-foreground">
        These Terms of Service govern your use of the Daily Note App. नीचे संक्षेप हिंदी में दिया गया है।
      </p>

      <section className="mb-6">
        <h2 className="text-xl font-medium mb-2">1. Acceptance</h2>
        <p>
          By using the App you agree to these Terms. If you do not agree, do not use the App.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-medium mb-2">2. User Accounts</h2>
        <p>
          You are responsible for maintaining the security of your account. Do not share credentials. We may
          suspend or terminate accounts that violate these Terms.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-medium mb-2">3. Acceptable Use</h2>
        <p>
          You must not use the App to store or share illegal content. Respect other users and do not attempt
          to circumvent security or abuse the service.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-medium mb-2">4. Intellectual Property</h2>
        <p>
          The App and its content are the property of the project (or licensors). You retain ownership of the
          content you create, but you grant the App a license to operate and display it.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-medium mb-2">5. Liability & Disclaimers</h2>
        <p>
          The App is provided as-is. We are not liable for indirect or consequential damages. For full legal
          terms consult a lawyer if necessary.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-medium mb-2">6. Changes</h2>
        <p>
          We may modify these Terms; we will post updates in the app. Continued use indicates acceptance of the
          updated terms.
        </p>
      </section>

      <hr className="my-6" />

      <h2 className="text-2xl font-semibold mb-3">संक्षेप (Hindi summary)</h2>
      <p>
        इन नियमों का उपयोग ऐप करने पर आप सहमत होते हैं। अपने अकाउंट की सुरक्षा आपकी ज़िम्मेदारी है।
      </p>

      <p className="text-sm text-muted-foreground mt-8">Last updated: {new Date().toLocaleDateString()}</p>
    </main>
  );
}
