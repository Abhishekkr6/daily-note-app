"use client";
import React from "react";

export default function PrivacyPage() {
  return (
    <main className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-semibold mb-4">Privacy Policy</h1>

      <p className="mb-4 text-muted-foreground">
        This Privacy Policy explains how Daily Note App ("we", "our", "the App") collects, uses, and
        protects your personal information. नीचे हिंदी में संक्षेप भी दिया गया है।
      </p>

      <section className="mb-6">
        <h2 className="text-xl font-medium mb-2">1. Information we collect</h2>
        <ul className="list-disc ml-6">
          <li>Account information such as name, email, avatar (when you sign in via OAuth).</li>
          <li>Content you create: tasks, notes, templates, profile settings and preferences.</li>
          <li>Usage information: logs, analytics and error reports (anonymous or aggregated).</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-medium mb-2">2. How we use information</h2>
        <ul className="list-disc ml-6">
          <li>To provide and improve the app functionality and user experience.</li>
          <li>To authenticate and identify users (via NextAuth and OAuth providers).</li>
          <li>To send optional notifications, account related emails, and support messages.</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-medium mb-2">3. Sharing & Third Parties</h2>
        <p>
          We do not sell your personal data. We may share data with third-party providers (for hosting,
          analytics, email delivery, OAuth providers). These providers have their own privacy practices.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-medium mb-2">4. Cookies & Local Storage</h2>
        <p>
          We use cookies (via NextAuth) and local storage to manage sessions and client preferences. You can
          control cookies through your browser settings.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-medium mb-2">5. Your rights</h2>
        <p>
          You can request access to, correction of, or deletion of your data by contacting us (see contact
          section). Some data (for example backups or audit logs) may be retained for operational purposes.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-medium mb-2">6. Contact</h2>
        <p>
          If you have questions about this privacy policy or want to exercise your data rights, contact us at
          the email address listed in the app or repository.
        </p>
      </section>

      <hr className="my-6" />

      <h2 className="text-2xl font-semibold mb-3">संक्षेप (Hindi summary)</h2>
      <p className="mb-2">
        यह प्राइवेसी पॉलिसी बताती है कि हम कौन-सी जानकारी इकट्ठा करते हैं (जैसे ईमेल, नाम, अवतार, और आपका
        कंटेंट) और उसे ऐप चलाने के लिए कैसे उपयोग करते हैं। हम आपकी निजी जानकारी बेचना नहीं करते।
      </p>

      <p className="text-sm text-muted-foreground mt-8">Last updated: {new Date().toLocaleDateString()}</p>
    </main>
  );
}
