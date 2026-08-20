import { queryAssistant } from './controllers/assistantController.js';

async function testQuery(queryText, label) {
  console.log(`\n🧪 Testing Query: "${queryText}" (${label})...`);
  const req = { body: { query: queryText, activeDistrictId: 2 } };
  let jsonResult = null;
  const res = {
    status: (code) => ({
      json: (data) => {
        console.error('Error Response:', code, data);
        return data;
      }
    }),
    json: (data) => {
      jsonResult = data;
      return data;
    }
  };

  await queryAssistant(req, res);
  if (jsonResult && jsonResult.success) {
    console.log(`   ✅ Success! Language: [${jsonResult.language}] | Tab Action: [${jsonResult.tabAction}]`);
    console.log(`   🗣️ Spoken Text: ${jsonResult.spokenText?.substring(0, 90)}...`);
    if (jsonResult.mapAction) {
      console.log(`   🗺️ Map Action:`, jsonResult.mapAction);
    }
  } else {
    console.error(`   ❌ Failed for query: ${queryText}`);
  }
}

async function runAll() {
  await testQuery('இன்று என்ன மாற்றம் நடந்துள்ளது?', 'Tamil: What Changed');
  await testQuery('Innaiku entha district worst-ah iruku?', 'Tanglish: Highest Risk');
  await testQuery('வளரும் மண்டலங்கள் காட்டு', 'Tamil: Emerging Zones');
  await testQuery('Coimbatore and Chennai compare pannu', 'Tanglish: Compare Districts');
  await testQuery('கோவை மாவட்ட விவரம் காட்டு', 'Tamil: Specific District (Coimbatore)');
  await testQuery('Show inter-state transit corridors', 'English: Corridors');
  process.exit(0);
}

runAll();
