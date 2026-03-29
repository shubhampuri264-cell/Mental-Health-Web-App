const { GoogleGenerativeAI } = require('@google/generative-ai');

async function runSimulation() {
  // Pulling the exact key from the new .env file you just updated
  const apiKey = 'AIzaSyCxIBgwaphYIksuZ2E0_ReAmnXbKvtjD1w';
  
  console.log('====================================');
  console.log('🤖 STARTING VIRTUAL SIMULATION 🤖');
  console.log('====================================\n');
  
  console.log('1. Initializing GoogleGenerativeAI with your API Key...');
  
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    
    console.log('2. Requesting the exact model: "gemini-2.0-flash"');
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: 'You are Phoenix, a helpful and empathetic companion.'
    });

    console.log('3. Starting Chat Session...');
    const chatSession = model.startChat({
      history: [],
      generationConfig: {
        maxOutputTokens: 100,
        temperature: 0.7,
      }
    });

    console.log('4. Sending test message: "Hello Phoenix! Are you online?"...');
    
    // Track the time dynamically
    const startTime = Date.now();
    const result = await chatSession.sendMessage('Hello Phoenix! Are you online?');
    const endTime = Date.now();
    
    console.log('\n✅ [SIMULATION SUCCESSFUL] (Took ' + (endTime - startTime) + 'ms)');
    console.log('------------------------------------');
    console.log('Phoenix Responded:');
    console.log('"' + result.response.text() + '"');
    console.log('------------------------------------');
    
  } catch (error) {
    console.error('\n❌ [SIMULATION FAILED]');
    console.error('The server rejected the connection. See details below:\n');
    console.error(error.message);
  }
}

runSimulation();
