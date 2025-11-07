
"use client";
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, UserCheck, Shield, Gavel, Copyright, AlertTriangle, RefreshCw } from "lucide-react";

export default function TermsPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-background py-10">
      <Card className="w-full max-w-2xl shadow-xl border border-border bg-card/80">
        <CardHeader className="flex flex-col items-center gap-2">
          <FileText className="w-10 h-10 text-primary mb-2" />
          <CardTitle className="text-3xl font-bold text-center">Terms of Service</CardTitle>
          <Badge variant="secondary" className="mt-2">Last updated: {new Date().toLocaleDateString()}</Badge>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-base text-muted-foreground text-center">
            These Terms of Service govern your use of the Daily Note App.<br />
            <span className="text-xs text-accent-foreground">नीचे संक्षेप हिंदी में दिया गया है।</span>
          </p>

          <section className="flex gap-4 items-start">
            <Shield className="w-6 h-6 text-accent mt-1" />
            <div>
              <h2 className="text-lg font-semibold mb-1">1. Acceptance</h2>
              <p className="text-sm">By using the App you agree to these Terms. If you do not agree, do not use the App.</p>
            </div>
          </section>

          <section className="flex gap-4 items-start">
            <UserCheck className="w-6 h-6 text-accent mt-1" />
            <div>
              <h2 className="text-lg font-semibold mb-1">2. User Accounts</h2>
              <p className="text-sm">You are responsible for maintaining the security of your account. Do not share credentials. We may suspend or terminate accounts that violate these Terms.</p>
            </div>
          </section>

          <section className="flex gap-4 items-start">
            <Gavel className="w-6 h-6 text-accent mt-1" />
            <div>
              <h2 className="text-lg font-semibold mb-1">3. Acceptable Use</h2>
              <p className="text-sm">You must not use the App to store or share illegal content. Respect other users and do not attempt to circumvent security or abuse the service.</p>
            </div>
          </section>

          <section className="flex gap-4 items-start">
            <Copyright className="w-6 h-6 text-accent mt-1" />
            <div>
              <h2 className="text-lg font-semibold mb-1">4. Intellectual Property</h2>
              <p className="text-sm">The App and its content are the property of the project (or licensors). You retain ownership of the content you create, but you grant the App a license to operate and display it.</p>
            </div>
          </section>

          <section className="flex gap-4 items-start">
            <AlertTriangle className="w-6 h-6 text-accent mt-1" />
            <div>
              <h2 className="text-lg font-semibold mb-1">5. Liability & Disclaimers</h2>
              <p className="text-sm">The App is provided as-is. We are not liable for indirect or consequential damages. For full legal terms consult a lawyer if necessary.</p>
            </div>
          </section>

          <section className="flex gap-4 items-start">
            <RefreshCw className="w-6 h-6 text-accent mt-1" />
            <div>
              <h2 className="text-lg font-semibold mb-1">6. Changes</h2>
              <p className="text-sm">We may modify these Terms; we will post updates in the app. Continued use indicates acceptance of the updated terms.</p>
            </div>
          </section>

          <div className="border-t pt-6 mt-4">
            <h2 className="text-xl font-semibold mb-2 text-center">संक्षेप (Hindi summary)</h2>
            <p className="text-sm text-center">
              इन नियमों का उपयोग ऐप करने पर आप सहमत होते हैं। अपने अकाउंट की सुरक्षा आपकी ज़िम्मेदारी है।
            </p>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
