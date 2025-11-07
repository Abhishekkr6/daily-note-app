
"use client";
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, User, Database, Cookie, Mail, Info } from "lucide-react";

export default function PrivacyPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-background py-10">
      <Card className="w-full max-w-2xl shadow-xl border border-border bg-card/80">
        <CardHeader className="flex flex-col items-center gap-2">
          <ShieldCheck className="w-10 h-10 text-primary mb-2" />
          <CardTitle className="text-3xl font-bold text-center">Privacy Policy</CardTitle>
          <Badge variant="secondary" className="mt-2">Last updated: {new Date().toLocaleDateString()}</Badge>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-base text-muted-foreground text-center">
            This Privacy Policy explains how Daily Note App ("we", "our", "the App") collects, uses, and protects your personal information.<br />
            <span className="text-xs text-accent-foreground">नीचे हिंदी में संक्षेप भी दिया गया है।</span>
          </p>

          <section className="flex gap-4 items-start">
            <User className="w-6 h-6 text-accent mt-1" />
            <div>
              <h2 className="text-lg font-semibold mb-1">1. Information we collect</h2>
              <ul className="list-disc ml-6 text-sm">
                <li>Account information such as name, email, avatar (when you sign in via OAuth).</li>
                <li>Content you create: tasks, notes, templates, profile settings and preferences.</li>
                <li>Usage information: logs, analytics and error reports (anonymous or aggregated).</li>
              </ul>
            </div>
          </section>

          <section className="flex gap-4 items-start">
            <Database className="w-6 h-6 text-accent mt-1" />
            <div>
              <h2 className="text-lg font-semibold mb-1">2. How we use information</h2>
              <ul className="list-disc ml-6 text-sm">
                <li>To provide and improve the app functionality and user experience.</li>
                <li>To authenticate and identify users (via NextAuth and OAuth providers).</li>
                <li>To send optional notifications, account related emails, and support messages.</li>
              </ul>
            </div>
          </section>

          <section className="flex gap-4 items-start">
            <Info className="w-6 h-6 text-accent mt-1" />
            <div>
              <h2 className="text-lg font-semibold mb-1">3. Sharing & Third Parties</h2>
              <p className="text-sm">
                We do not sell your personal data. We may share data with third-party providers (for hosting, analytics, email delivery, OAuth providers). These providers have their own privacy practices.
              </p>
            </div>
          </section>

          <section className="flex gap-4 items-start">
            <Cookie className="w-6 h-6 text-accent mt-1" />
            <div>
              <h2 className="text-lg font-semibold mb-1">4. Cookies & Local Storage</h2>
              <p className="text-sm">
                We use cookies (via NextAuth) and local storage to manage sessions and client preferences. You can control cookies through your browser settings.
              </p>
            </div>
          </section>

          <section className="flex gap-4 items-start">
            <Badge variant="outline" className="mt-1">Your Rights</Badge>
            <div>
              <h2 className="text-lg font-semibold mb-1">5. Your rights</h2>
              <p className="text-sm">
                You can request access to, correction of, or deletion of your data by contacting us (see contact section). Some data (for example backups or audit logs) may be retained for operational purposes.
              </p>
            </div>
          </section>

          <section className="flex gap-4 items-start">
            <Mail className="w-6 h-6 text-accent mt-1" />
            <div>
              <h2 className="text-lg font-semibold mb-1">6. Contact</h2>
              <p className="text-sm">
                If you have questions about this privacy policy or want to exercise your data rights, contact us at the email address listed in the app or repository.
              </p>
            </div>
          </section>

          <div className="border-t pt-6 mt-4">
            <h2 className="text-xl font-semibold mb-2 text-center">संक्षेप (Hindi summary)</h2>
            <p className="text-sm text-center">
              यह प्राइवेसी पॉलिसी बताती है कि हम कौन-सी जानकारी इकट्ठा करते हैं (जैसे ईमेल, नाम, अवतार, और आपका कंटेंट) और उसे ऐप चलाने के लिए कैसे उपयोग करते हैं। हम आपकी निजी जानकारी बेचना नहीं करते।
            </p>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
