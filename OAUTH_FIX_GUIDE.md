# OAuth Login Fix - Complete Guide

## ❌ समस्या
Google और GitHub से login करने पर यह error आ रहा है:
```
https://daily-note-karo.vercel.app/login?callbackUrl=https%3A%2F%2Fdaily-note-karo.vercel.app%2Fhome&error=OAuthCallback
```

## ✅ समाधान - Step by Step

### Step 1: Google OAuth Configuration

1. **Google Cloud Console** खोलें: https://console.cloud.google.com/
2. आपका project select करें
3. Left sidebar से **APIs & Services** > **Credentials** पर जाएं
4. **OAuth 2.0 Client IDs** section में आपकी Client ID ढूंढें:
   ```
   YOUR_GOOGLE_CLIENT_ID
   ```
5. उस पर click करें
6. **Authorized redirect URIs** section में scroll करें
7. ये URIs add करें (अगर already नहीं हैं):
   ```
   https://daily-note-karo.vercel.app/api/auth/callback/google
   ```
8. **SAVE** button दबाएं

**Screenshot Location**: Settings के नीचे "Authorized redirect URIs" section

---

### Step 2: GitHub OAuth Configuration

1. GitHub खोलें और अपने account में login करें
2. इस link पर जाएं: https://github.com/settings/developers
3. Left sidebar से **OAuth Apps** select करें
4. आपकी app list में दिखेगी - उस पर click करें
5. **Application settings** page पर:
   - **Homepage URL**: `https://daily-note-karo.vercel.app`
   - **Authorization callback URL**: `https://daily-note-karo.vercel.app/api/auth/callback/github`
6. **Update application** button दबाएं

**Important**: GitHub में सिर्फ एक ही callback URL होता है, multiple नहीं।

---

### Step 3: Vercel Environment Variables

1. Vercel Dashboard खोलें: https://vercel.com/dashboard
2. अपना project **"daily-note-karo"** select करें
3. Top में **Settings** tab पर click करें
4. Left sidebar से **Environment Variables** select करें
5. ये सभी variables check करें (अगर missing हैं तो add करें):

```bash
# ⚠️ MOST IMPORTANT
NEXTAUTH_URL=https://daily-note-karo.vercel.app
NEXTAUTH_SECRET=your_nextauth_secret_here

# Google OAuth (Get from Google Cloud Console)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# GitHub OAuth (Get from GitHub Settings)
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Database (Get from MongoDB Atlas)
MONGO_URI=your_mongodb_connection_string
```

6. **Save** करें

---

### Step 4: Redeploy

Vercel में changes apply होने के लिए:

1. Vercel Dashboard में अपने project पर जाएं
2. **Deployments** tab select करें
3. सबसे ऊपर की (latest) deployment पर hover करें
4. Right side में **three dots (⋯)** menu click करें
5. **Redeploy** select करें
6. Confirmation popup में **Redeploy** confirm करें

या फिर:
```bash
git add .
git commit -m "fix: OAuth configuration for production"
git push origin main
```

---

### Step 5: Testing

1. Clear browser cache या Incognito mode use करें
2. https://daily-note-karo.vercel.app पर जाएं
3. **Sign up** या **Login** page पर जाएं
4. **Continue with Google** या **Continue with GitHub** button click करें
5. OAuth provider (Google/GitHub) की permission screen आएगी
6. **Allow** करें
7. आपको `/home` page पर redirect होना चाहिए

---

## 🔍 Troubleshooting

### अगर फिर भी error आए:

#### 1. Vercel Logs Check करें:
```bash
# Vercel Dashboard > Project > Deployments > Latest > Functions
```

Logs में ये messages देखें:
- `OAuth user data:` - User का data mil रहा है या नहीं
- `NextAuth event error:` - Koi specific error
- `MongoDB connection` - Database connect हो रहा है या नहीं

#### 2. Browser Console Check करें:
```
F12 > Console tab
```

Network errors या CORS issues check करें।

#### 3. OAuth Provider Logs:
- **Google**: Cloud Console > APIs & Services > Credentials > Usage
- **GitHub**: Settings > Developer Settings > OAuth Apps > Your App

Failed authorization attempts देखें।

---

## ✅ Verification Checklist

- [ ] Google Cloud Console में redirect URI है: `https://daily-note-karo.vercel.app/api/auth/callback/google`
- [ ] GitHub OAuth App में callback URL है: `https://daily-note-karo.vercel.app/api/auth/callback/github`
- [ ] Vercel में `NEXTAUTH_URL` सही set है
- [ ] Vercel में `NEXTAUTH_SECRET` set है
- [ ] Vercel में Google credentials set हैं
- [ ] Vercel में GitHub credentials set हैं
- [ ] Vercel में MongoDB URI set है
- [ ] Latest changes deploy हो गए हैं
- [ ] Browser cache clear है

---

## 🚨 Common Mistakes

1. **Redirect URI में typo**: `/callback/` की जगह `/callbacks/` या `/auth/` missing
2. **HTTP vs HTTPS**: Local के `http://localhost` production में use करना
3. **NEXTAUTH_URL missing**: Vercel में यह variable ज़रूर set होना चाहिए
4. **Environment variables deploy नहीं हुए**: Variables add करने के बाद redeploy करना ज़रूरी है
5. **Multiple OAuth Apps**: Production और development के लिए अलग-अलग OAuth apps होने चाहिए

---

## 📞 अगर Problem Solve नहीं हुई

1. Vercel deployment logs screenshot लें
2. Browser console errors screenshot लें
3. GitHub/Google OAuth app settings screenshot लें
4. यह information share करें:
   - Error message exactly क्या है
   - Console में कौन सी errors दिख रही हैं
   - Vercel logs में क्या show हो रहा है

---

## 🎯 Expected Behavior

**Successful OAuth Flow:**
1. User "Continue with Google" click करता है
2. Google authorization page खुलता है
3. User permission देता है
4. Google app को redirect करता है: `https://daily-note-karo.vercel.app/api/auth/callback/google?code=...`
5. NextAuth code verify करता है
6. Database में user create/update होता है
7. Session बनता है
8. User `/home` page पर redirect होता है

---

## 📄 Files Modified

1. `src/app/api/auth/[...nextauth]/route.js` - Debug mode enabled
2. `VERCEL_ENV_VARS.md` - Environment variables reference
3. `scripts/check-oauth.js` - OAuth configuration checker

---

## 🔄 After Fix

Changes deploy होने के बाद:
1. 5-10 minutes wait करें (Vercel propagation के लिए)
2. Browser cache clear करें या Incognito mode use करें
3. Fresh login attempt करें

---

**Good Luck! 🚀**
