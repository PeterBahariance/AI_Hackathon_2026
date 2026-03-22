const admin = require('firebase-admin');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

const serviceAccount = require(path.join(__dirname, "../serviceAccountKey.json"));
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

async function uploadCSV(fileName, collectionName) {
  // This points to AI_Hackathon_2026/data/
  const filePath = path.join(__dirname, "../../data", fileName);
  const results = [];

  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    return;
  }

  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      console.log(`🚀 Starting upload for ${collectionName} (${results.length} rows)...`);
      try {
        for (const row of results) {
          await db.collection(collectionName).add(row);
        }
        console.log(`✅ Successfully uploaded ${collectionName}`);
      } catch (error) {
        console.error(`❌ Error uploading to ${collectionName}:`, error.message);
      }
    });
}

uploadCSV('data_cpp_course_schedule.csv', 'courses');
uploadCSV('data_cpp_events_contacts.csv', 'events_contacts');
uploadCSV('data_event_calendar.csv', 'event_calendar');
uploadCSV('data_speaker_profiles.csv', 'volunteers');