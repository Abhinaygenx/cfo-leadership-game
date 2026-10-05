# Google Sheet & Automated EOD Email Setup Guide

This project connects your **CFO Leadership Journey (Snakes & Ladders)** survey game to a **Google Sheet**, storing all participants' answers in **one row per respondent with 20 clean columns for questions Q1 to Q20**, and automatically emailing an **End-of-Day (EOD) summary report** to **`mmsbf26015@stu.xim.edu.in`**.

---

## 3 Simple Steps to Connect Google Sheets & EOD Email

### Step 1: Create a Google Sheet & Open Apps Script
1. Go to [Google Sheets](https://sheets.new) and create a new blank spreadsheet.
2. Name the spreadsheet (e.g. `CFO Leadership Game Responses`).
3. In the top menu, click **Extensions** > **Apps Script**.

---

### Step 2: Paste the Script Code
1. In the Apps Script code editor, delete any existing placeholder code.
2. Open [`GoogleAppsScript.gs`](file:///c:/Users/Abhin/Desktop/game/GoogleAppsScript.gs) in this directory and copy all its contents.
3. Paste the contents into the Apps Script editor.
4. Click the **Save** icon (💾).

---

### Step 3: Deploy as a Web App
1. In the top right corner of the Apps Script window, click **Deploy** > **New deployment**.
2. Click the gear icon (⚙️) next to *Select type* and choose **Web app**.
3. Fill in the details:
   - **Description**: `CFO Game Response Collector`
   - **Execute as**: `Me (your email)`
   - **Who has access**: **`Anyone`** *(Important: Must be set to "Anyone" so player responses can submit without requiring Google sign-in)*
4. Click **Deploy**.
5. Google will ask you to authorize permissions. Click **Authorize access**, choose your Google account, click **Advanced** > **Go to Untitled project (unsafe)**, and click **Allow**.
6. Copy the **Web App URL** provided (it ends in `/exec`).

---

### Step 4: Enable Automated Daily EOD Email
1. In the Apps Script toolbar, locate the function dropdown (it usually says `myFunction` or `getHeaders`).
2. Select **`setupDailyEodTrigger`** from the dropdown.
3. Click **Run**.
   - *This creates an automatic daily trigger that executes `sendDailyEodEmail()` every evening at 8:00 PM IST.*
   - *It will send the day's summary and attach a CSV file directly to `mmsbf26015@stu.xim.edu.in`.*
4. *(Optional Test)*: You can also select **`testSendEodEmail`** and click **Run** to receive an immediate test email!

---

### Step 5: Connect URL to the Game
You can connect the URL in either of two easy ways:

- **Method A (No code editing)**: Open [`index.html`](file:///c:/Users/Abhin/Desktop/game/index.html) in your browser, click **"Google Sheet Settings"** in the footer, paste your Web App URL, and click **Save URL**.
- **Method B (Permanent in code)**: Open [`index.html`](file:///c:/Users/Abhin/Desktop/game/index.html) and update line 186:
  ```javascript
  let SHEET_URL = "PASTE_YOUR_WEB_APP_URL_HERE";
  ```

---

## 📋 Google Sheet Column Layout (Single Row per User)

Every participant who plays the game is saved in a single row with the following organized columns:

| Col # | Header | Description |
|---|---|---|
| 1–4 | **Timestamp, ID, Name, Email** | Respondent identification |
| 5–8 | **Age, Age Group, Gender, Status** | Demographics |
| 9–15 | **Score (%), Winner, Squares, Turns, Time** | Game outcome & summary metrics |
| **16–35** | **Q1 to Q20 (20 Columns)** | **Clean individual ratings (1 to 7) for all 20 questions** |
| 36–39 | **L1 to L4 Category Averages** | Analytical, People, Strategy, Ethics averages |
| 40–41 | **NPS Score, Comments** | Optional feedback |

---

## 📧 Daily EOD Email Features
- **Recipient**: `mmsbf26015@stu.xim.edu.in`
- **Schedule**: Every evening at 8:00 PM IST
- **Contents**:
  - Total all-time participants count
  - Today's new participant count
  - Clean HTML preview table of recent respondents
  - Direct 1-click button to open the live Google Sheet
  - **Attached `.csv` file** containing all user details and the 20 question columns for easy import into Excel/SPSS/R.
