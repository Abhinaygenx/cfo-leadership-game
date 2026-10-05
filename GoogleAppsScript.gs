/**
 * =========================================================================
 * CFO LEADERSHIP JOURNEY — GOOGLE APPS SCRIPT FOR RESPONSES & EOD EMAIL
 * =========================================================================
 * 
 * Target Email for End-of-Day (EOD) Report:
 * mmsbf26015@stu.xim.edu.in
 *
 * This script:
 * 1. Collects every game participant's response into a clean Google Sheet row.
 * 2. Formats 20 dedicated columns for Q1 through Q20 with clean headers.
 * 3. Sends an automated End-of-Day (EOD) summary email with a CSV attachment
 *    and a link to the Google Sheet at 8:00 PM (or on-demand).
 * =========================================================================
 */

// CONFIGURATION
const EOD_EMAIL = "mmsbf26015@stu.xim.edu.in";
const SHEET_NAME = "CFO_Game_Responses";

/**
 * 20 Question Labels for Clean Headers
 */
const QUESTION_HEADERS = [
  "Q1: Recheck under pressure",
  "Q2: Weak data, popular view",
  "Q3: Risk and return",
  "Q4: Own assumptions first",
  "Q5: Conflicting numbers",
  "Q6: Honest feedback",
  "Q7: Credit taken",
  "Q8: Steady tone",
  "Q9: Working with a rival",
  "Q10: Removing a weak performer",
  "Q11: Long-term plan",
  "Q12: Owning a failure",
  "Q13: Unpopular decision",
  "Q14: Letting go",
  "Q15: Fair distribution",
  "Q16: Bending the truth",
  "Q17: Adjusting figures",
  "Q18: A friend's dishonesty",
  "Q19: Unearned credit",
  "Q20: Honesty has a cost"
];

/**
 * Full Column Headers for the Google Sheet (in order)
 */
function getHeaders() {
  return [
    "Timestamp",
    "Respondent ID",
    "Full Name",
    "Email",
    "Age",
    "Age Group",
    "Gender",
    "Current Status",
    "Leadership Score (%)",
    "Board Winner",
    "User Final Square",
    "Alex Final Square",
    "Total Rating (out of 140)",
    "Turns Played",
    "Time Taken (mins)",
    ...QUESTION_HEADERS,
    "L1: Analytical Avg",
    "L2: People Avg",
    "L3: Strategy Avg",
    "L4: Ethics Avg",
    "NPS Score (0-10)",
    "Feedback / Comments"
  ];
}

/**
 * Get or create the responses sheet with beautiful styling
 */
function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  
  // If first row is empty, setup headers and formatting
  if (sheet.getLastRow() === 0) {
    const headers = getHeaders();
    sheet.appendRow(headers);
    
    // Style Header Row
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground("#0b232b")
               .setFontColor("#f4ead7")
               .setFontWeight("bold")
               .setFontSize(10)
               .setWrap(true)
               .setVerticalAlignment("middle")
               .setHorizontalAlignment("center");
               
    sheet.setRowHeight(1, 38);
    sheet.setFrozenRows(1);
    sheet.setFrozenColumns(4); // Freeze up to Full Name & Email
    
    // Set column widths
    sheet.setColumnWidth(1, 150); // Timestamp
    sheet.setColumnWidth(2, 110); // ID
    sheet.setColumnWidth(3, 160); // Name
    sheet.setColumnWidth(4, 210); // Email
    sheet.setColumnWidth(5, 60);  // Age
    sheet.setColumnWidth(6, 90);  // Age Group
    sheet.setColumnWidth(7, 80);  // Gender
    sheet.setColumnWidth(8, 110); // Status
    sheet.setColumnWidth(9, 130); // Leadership Score %
    sheet.setColumnWidth(10, 150); // Winner
    sheet.setColumnWidth(11, 100); // User Square
    sheet.setColumnWidth(12, 100); // Alex Square
    sheet.setColumnWidth(13, 120); // Total Rating
    sheet.setColumnWidth(14, 90);  // Turns
    sheet.setColumnWidth(15, 110); // Minutes
    
    // 20 Question columns (width 110 each)
    for (let c = 16; c <= 35; c++) {
      sheet.setColumnWidth(c, 115);
    }
  }
  return sheet;
}

/**
 * Handle incoming POST requests from the game
 */
function doPost(e) {
  try {
    const sheet = getOrCreateSheet();
    const payload = JSON.parse(e.postData.contents);
    
    // 1. Handle post-game feedback update if sent separately
    if (payload.feedback && payload.feedback.RespondentID) {
      updateFeedback(sheet, payload.feedback);
      return ContentService.createTextOutput(JSON.stringify({ status: "success", type: "feedback" }))
                           .setMimeType(ContentService.MimeType.JSON);
    }
    
    // 2. Handle full game result row
    const rowData = payload.row || payload;
    
    // Extract 20 Question Ratings
    const qRatings = [];
    for (let i = 1; i <= 20; i++) {
      const val = rowData["Q" + i + "_Rating"] !== undefined ? rowData["Q" + i + "_Rating"] : "";
      qRatings.push(val);
    }
    
    const row = [
      new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
      rowData.RespondentID || "",
      rowData.Name || "",
      rowData.Email || "",
      rowData.Age || "",
      rowData.AgeGroup || "",
      rowData.Gender || "",
      rowData.CurrentStatus || "",
      rowData.AccuracyPct !== undefined ? rowData.AccuracyPct + "%" : "",
      rowData.Winner || "",
      rowData.UserFinalSquare || "",
      rowData.BotFinalSquare || "",
      rowData.TotalRating || "",
      rowData.Turns || "",
      rowData.TotalMinutes || "",
      ...qRatings,
      rowData.L1_AvgRating || "",
      rowData.L2_AvgRating || "",
      rowData.L3_AvgRating || "",
      rowData.L4_AvgRating || "",
      rowData.Survey_NPS || "",
      rowData.Survey_Comment || ""
    ];
    
    sheet.appendRow(row);
    
    // Format the new data row nicely
    const lastRow = sheet.getLastRow();
    const dataRange = sheet.getRange(lastRow, 1, 1, row.length);
    dataRange.setFontSize(10).setVerticalAlignment("middle");
    
    // Subtle alternating row background
    if (lastRow % 2 === 0) {
      dataRange.setBackground("#f9fafb");
    } else {
      dataRange.setBackground("#ffffff");
    }
    
    // Center numbers and ratings
    sheet.getRange(lastRow, 5, 1, 1).setHorizontalAlignment("center");
    sheet.getRange(lastRow, 9, 1, 6).setHorizontalAlignment("center");
    sheet.getRange(lastRow, 16, 1, 24).setHorizontalAlignment("center");
    
    return ContentService.createTextOutput(JSON.stringify({ status: "success", row: lastRow }))
                         .setMimeType(ContentService.MimeType.JSON);
                         
  } catch (error) {
    Logger.log("Error in doPost: " + error.toString());
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
                         .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Update feedback rating & comment for an existing respondent
 */
function updateFeedback(sheet, fb) {
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][1]) === String(fb.RespondentID)) { // Column B: Respondent ID
      const rowNum = i + 1;
      const headers = getHeaders();
      const npsCol = headers.indexOf("NPS Score (0-10)") + 1;
      const cmtCol = headers.indexOf("Feedback / Comments") + 1;
      
      if (fb.Survey_NPS !== undefined && fb.Survey_NPS !== "") {
        sheet.getRange(rowNum, npsCol).setValue(fb.Survey_NPS);
      }
      if (fb.Survey_Comment !== undefined) {
        sheet.getRange(rowNum, cmtCol).setValue(fb.Survey_Comment);
      }
      break;
    }
  }
}

/**
 * Handle GET request (can be used to verify web app is alive)
 */
function doGet(e) {
  return ContentService.createTextOutput("CFO Leadership Journey Google Sheet Service is Active! Target EOD Email: " + EOD_EMAIL);
}

/**
 * =========================================================================
 * END-OF-DAY (EOD) AUTOMATED EMAIL FUNCTION
 * =========================================================================
 * Sends a daily summary email with an attached CSV and link to the sheet.
 */
function sendDailyEodEmail() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME);
  
  if (!sheet || sheet.getLastRow() <= 1) {
    MailApp.sendEmail({
      to: EOD_EMAIL,
      subject: "CFO Leadership Journey — EOD Report (" + Utilities.formatDate(new Date(), "Asia/Kolkata", "dd MMM yyyy") + ")",
      body: "Hello,\n\nNo game responses were recorded today (" + Utilities.formatDate(new Date(), "Asia/Kolkata", "dd MMM yyyy") + ").\n\nGoogle Sheet Link:\n" + ss.getUrl()
    });
    return;
  }
  
  const values = sheet.getDataRange().getValues();
  const headers = values[0];
  const rows = values.slice(1);
  const totalCount = rows.length;
  
  // Filter today's responses (IST)
  const todayStr = Utilities.formatDate(new Date(), "Asia/Kolkata", "dd/MM/yyyy");
  const todayRows = rows.filter(r => {
    const ts = String(r[0]);
    return ts.indexOf(todayStr) !== -1 || ts.indexOf(Utilities.formatDate(new Date(), "Asia/Kolkata", "yyyy-MM-dd")) !== -1;
  });
  
  // Generate CSV File content
  let csvContent = "";
  for (let i = 0; i < values.length; i++) {
    const rowEscaped = values[i].map(val => {
      let cell = String(val).replace(/"/g, '""');
      if (cell.search(/("|,|\n)/g) >= 0) {
        cell = '"' + cell + '"';
      }
      return cell;
    });
    csvContent += rowEscaped.join(",") + "\r\n";
  }
  
  const dateStr = Utilities.formatDate(new Date(), "Asia/Kolkata", "yyyy-MM-dd");
  const csvBlob = Utilities.newBlob(csvContent, "text/csv", "CFO_Game_Responses_" + dateStr + ".csv");
  
  // Build clean HTML email body
  let htmlBody = `
  <div style="font-family: 'Segoe UI', Helvetica, Arial, sans-serif; max-width: 650px; margin: auto; padding: 20px; border: 1px solid #d3d8d4; border-radius: 8px; background-color: #ffffff;">
    <div style="background: linear-gradient(90deg,#0b232b,#1a4e5c); padding: 18px 22px; border-radius: 6px; color: #ffffff; border-bottom: 3px solid #c99a3b;">
      <h2 style="margin: 0; font-family: Georgia, serif; font-size: 22px; color: #f4ead7;">CFO Leadership Journey — End of Day (EOD) Report</h2>
      <p style="margin: 4px 0 0; font-size: 13px; color: #d0e4e7;">Date: ${Utilities.formatDate(new Date(), "Asia/Kolkata", "EEEE, dd MMMM yyyy (hh:mm a IST)")}</p>
    </div>
    
    <div style="padding: 20px 0;">
      <p style="font-size: 15px; color: #1c2b30;">Hello,</p>
      <p style="font-size: 14px; color: #33464c; line-height: 1.5;">
        Here is your daily summary of all users who played the <strong>CFO Leadership Journey (Snakes & Ladders)</strong> game today.
      </p>
      
      <table style="width: 100%; border-collapse: collapse; margin: 18px 0; background: #fdfbf7; border: 1px solid #ebd9b5; border-radius: 6px;">
        <tr>
          <td style="padding: 12px 16px; border-bottom: 1px solid #ebd9b5; font-size: 14px; color: #5b6b70;">Total Participants (All-Time):</td>
          <td style="padding: 12px 16px; border-bottom: 1px solid #ebd9b5; font-size: 18px; font-weight: bold; color: #14303a; text-align: right;">${totalCount}</td>
        </tr>
        <tr>
          <td style="padding: 12px 16px; border-bottom: 1px solid #ebd9b5; font-size: 14px; color: #5b6b70;">New Participants Today:</td>
          <td style="padding: 12px 16px; border-bottom: 1px solid #ebd9b5; font-size: 18px; font-weight: bold; color: #1f6f78; text-align: right;">${todayRows.length}</td>
        </tr>
      </table>
      
      <h3 style="font-family: Georgia, serif; font-size: 16px; color: #14303a; margin-top: 24px;">Recent Respondents Summary:</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 13px; text-align: left; margin-top: 8px;">
        <thead>
          <tr style="background-color: #0b232b; color: #ffffff;">
            <th style="padding: 8px 10px; border: 1px solid #0b232b;">Name</th>
            <th style="padding: 8px 10px; border: 1px solid #0b232b;">Email</th>
            <th style="padding: 8px 10px; border: 1px solid #0b232b;">Score</th>
            <th style="padding: 8px 10px; border: 1px solid #0b232b;">Outcome</th>
          </tr>
        </thead>
        <tbody>
  `;
  
  // Show the last 10 rows
  const displayRows = rows.slice(-10);
  for (let i = 0; i < displayRows.length; i++) {
    const r = displayRows[i];
    const bg = i % 2 === 0 ? "#f9fafb" : "#ffffff";
    htmlBody += `
      <tr style="background-color: ${bg};">
        <td style="padding: 8px 10px; border-bottom: 1px solid #e5e7eb; font-weight: 600; color: #1f2937;">${r[2]}</td>
        <td style="padding: 8px 10px; border-bottom: 1px solid #e5e7eb; color: #4b5563;">${r[3]}</td>
        <td style="padding: 8px 10px; border-bottom: 1px solid #e5e7eb; color: #1f6f78; font-weight: bold;">${r[8]}</td>
        <td style="padding: 8px 10px; border-bottom: 1px solid #e5e7eb; color: #4b5563;">${r[9]}</td>
      </tr>
    `;
  }
  
  htmlBody += `
        </tbody>
      </table>
      
      <div style="margin-top: 24px; text-align: center;">
        <a href="${ss.getUrl()}" style="display: inline-block; background-color: #1f6f78; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 14px;">
          📊 Open Live Google Sheet
        </a>
      </div>
      
      <p style="font-size: 12px; color: #6b7280; margin-top: 24px; line-height: 1.4;">
        📎 <em>A clean CSV file with all 20 question responses and user details is attached to this email.</em>
      </p>
    </div>
  </div>
  `;
  
  MailApp.sendEmail({
    to: EOD_EMAIL,
    subject: "CFO Leadership Journey — Daily EOD Report (" + Utilities.formatDate(new Date(), "Asia/Kolkata", "dd MMM yyyy") + ")",
    htmlBody: htmlBody,
    attachments: [csvBlob]
  });
  
  Logger.log("EOD email sent successfully to " + EOD_EMAIL);
}

/**
 * =========================================================================
 * ONE-CLICK AUTOMATIC TRIGGER SETUP
 * =========================================================================
 * Run this function once from the Google Apps Script editor.
 * It schedules sendDailyEodEmail to run automatically every night at 8:00 PM - 9:00 PM IST.
 */
function setupDailyEodTrigger() {
  // Clear any existing triggers to avoid duplicates
  const triggers = ScriptApp.getProjectTriggers();
  for (let i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === "sendDailyEodEmail") {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }
  
  // Create daily trigger at 20:00 (8:00 PM)
  ScriptApp.newTrigger("sendDailyEodEmail")
           .timeBased()
           .everyDays(1)
           .atHour(20)
           .inTimezone("Asia/Kolkata")
           .create();
           
  Logger.log("Daily EOD trigger created successfully for 8:00 PM IST!");
}

/**
 * Manual test function to verify that email sending works right away
 */
function testSendEodEmail() {
  sendDailyEodEmail();
}
