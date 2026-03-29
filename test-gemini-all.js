const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testAllModels() {
  const apiKey = 'AIzaSyCxIBgwaphYIksuZ2E0_ReAmnXbKvtjD1w';
  const genAI = new GoogleGenerativeAI(apiKey);
  
  const modelsToTest = [
    'gemini-2.0-flash',
    'gemini-1.5-flash',
    'gemini-1.5-flash-8b',
    'gemini-pro'
  ];

  console.log('🤖 RUNNING VIRTUAL SIMULATOR ON ' + modelsToTest.length + ' MODELS 🤖\n');

  for (const modelName of modelsToTest) {
    console.log(`Testing model: [${modelName}] ...`);
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent('Say exactly the word "Hello"');
      console.log(`✅ [SUCCESS] ${modelName} is ONLINE and answered: ${result.response.text().trim()}`);
    } catch (e) {
      if (e.message.includes('429')) {
         console.log(`❌ [RATE LIMIT 429] ${modelName} is supported, but you are out of free-tier quota.`);
      } else if (e.message.includes('404')) {
         console.log(`❌ [NOT FOUND 404] ${modelName} is not accessible with this API key.`);
      } else {
         console.log(`❌ [UNKNOWN ERROR] ${e.message}`);
      }
    }
    console.log('-------------------------------------------');
  }
}

testAllModels();
