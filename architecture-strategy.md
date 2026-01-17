
# OdontoMind AI: Functional Implementation Architecture

## 1. Multi-Tenant Identity & Auth (OAuth 2.0)
The system uses a **Unified Identity Provider** strategy.
- **Provider Choice**: Google Identity Platform or Azure AD B2C.
- **Required Scopes for Google**:
  - `openid`, `profile`, `email`
  - `https://www.googleapis.com/auth/gmail.modify` (Read/Write for AI follow-ups)
  - `https://www.googleapis.com/auth/calendar` (Full sync)
  - `https://www.googleapis.com/auth/drive.file` (Storage for patient charts/X-rays)
- **Required Scopes for Microsoft**:
  - `User.Read`, `Mail.ReadWrite`, `Calendars.ReadWrite`, `Files.ReadWrite`.

## 2. Serverless Backend Pipeline
- **Auth Service**: Manages state, session tokens (JWT), and refresh token rotation logic.
- **Workers**: 
  - `SyncWorker`: Runs every 15m to fetch new messages/events.
  - `AIWorker`: Triggered by `SyncWorker` to categorize content via Gemini.

## 3. Storage
- **Relational Metadata**: User profiles, Org settings, Pipeline config.
- **Unstructured Data**: AI transcription results, raw email snapshots (transient), patient file metadata.

## 4. Checkpoint MVP Functional
- [x] Functional Login UI with multi-provider choice.
- [x] Session persistence using local storage (simulated JWT).
- [x] Integration dashboard showing granular service status (Email, Calendar, Drive).
- [x] Functional Logout mechanism.
