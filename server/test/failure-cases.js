// Automated test suite testing validation rules, error handling, and mocked AI failure cases.
import { Duplex, Readable, Writable } from 'stream';
import app from '../src/app.js';
import { __setMockGenerator } from '../src/services/ai.service.js';
import { AppError } from '../src/utils/AppError.js';

/**
 * Dispatches an HTTP request into the Express application in-memory.
 * Avoids environment/sandbox socket restrictions while exercising the full
 * middleware, routing, validation, error handler, and response pipeline.
 */
function dispatchRequest(method, path, body = {}) {
  return new Promise((resolve) => {
    const payload = JSON.stringify(body);
    let pushed = false;

    // Create a mock Duplex socket stream required by Node's HTTP parser
    const socket = new Duplex({
      read() {},
      write(chunk, enc, cb) {
        cb();
      },
    });
    socket.remoteAddress = '127.0.0.1';
    socket.encrypted = false;

    // Create Readable HTTP request
    const req = new Readable({
      read() {
        if (!pushed) {
          this.push(payload);
          this.push(null);
          pushed = true;
        }
      },
    });
    req.method = method;
    req.url = path;
    req.headers = {
      'content-type': 'application/json',
      'content-length': Buffer.byteLength(payload).toString(),
      host: 'localhost',
    };
    req.socket = socket;
    req.connection = socket;
    req.ip = '127.0.0.1';

    // Create Writable HTTP response
    let resBody = '';
    const res = new Writable({
      write(chunk, encoding, cb) {
        resBody += chunk;
        cb();
      },
    });
    res.statusCode = 200;
    res.headers = {};
    res.setHeader = (k, v) => {
      res.headers[k.toLowerCase()] = v;
    };
    res.getHeader = (k) => res.headers[k.toLowerCase()];
    res.writeHead = (s, h) => {
      res.statusCode = s;
      if (h) Object.assign(res.headers, h);
    };
    res.end = (chunk) => {
      if (chunk) resBody += chunk;
      let parsed = null;
      try {
        parsed = JSON.parse(resBody);
      } catch {
        parsed = resBody;
      }
      resolve({ status: res.statusCode, data: parsed });
    };

    app.handle(req, res);
  });
}

// Sample valid lesson mock conforming to LessonSchema
const validLessonPayload = {
  title: 'Introduction to Photosynthesis',
  summary: 'The biochemical process by which plants convert light energy into chemical energy.',
  sections: [
    {
      id: 'sec-1',
      heading: 'Light-Dependent Reactions',
      explanation: 'Photons strike chlorophyll molecules, exciting electrons and splitting water.',
      keyPoints: ['Occurs in thylakoid membranes', 'Generates ATP and NADPH'],
      example: 'Sunlight shining on a green leaf charging chloroplast complexes.',
    },
    {
      id: 'sec-2',
      heading: 'The Calvin Cycle',
      explanation: 'Carbon fixation synthesizes glucose from carbon dioxide using ATP and NADPH.',
      keyPoints: ['Occurs in the stroma', 'Catalyzed by the Rubisco enzyme'],
      example: 'Plants capturing ambient carbon dioxide to build structural cellulose.',
    },
    {
      id: 'sec-3',
      heading: 'Ecological Significance',
      explanation: 'Produces atmospheric oxygen and forms the primary trophic level of ecosystems.',
      keyPoints: ['Supplies terrestrial oxygen', 'Base of oceanic and land food webs'],
      example: 'Forests and phytoplankton sustaining global aerobic life.',
    },
  ],
};

async function runAllTests() {
  console.log(`\n================================================================`);
  console.log(` RECALL BACKEND TEST SUITE: FAILURE & EDGE CASES`);
  console.log(` Testing Express routes, Zod validation, and AI failure recovery`);
  console.log(`================================================================\n`);

  let passed = 0;
  let failed = 0;

  function report(name, isPass, detail = '') {
    if (isPass) {
      console.log(`  ✓ PASS: ${name}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${name} ${detail ? `(${detail})` : ''}`);
      failed++;
    }
  }

  try {
    // -------------------------------------------------------------
    // 1. Valid lesson request
    // -------------------------------------------------------------
    __setMockGenerator(async () => JSON.stringify(validLessonPayload));
    const t1 = await dispatchRequest('POST', '/api/lesson', {
      topic: 'Photosynthesis',
      level: 'beginner',
    });
    report(
      'Valid lesson request returns 200 with structured data',
      t1.status === 200 &&
        t1.data?.ok === true &&
        t1.data?.data?.title === 'Introduction to Photosynthesis' &&
        t1.data?.data?.sections?.length === 3,
      `status: ${t1.status}, ok: ${t1.data?.ok}`
    );

    // -------------------------------------------------------------
    // 2. Empty topic
    // -------------------------------------------------------------
    const t2 = await dispatchRequest('POST', '/api/lesson', {
      topic: '   ',
      level: 'beginner',
    });
    report(
      'Empty topic rejected (400 BAD_INPUT)',
      t2.status === 400 &&
        t2.data?.ok === false &&
        t2.data?.error?.code === 'BAD_INPUT' &&
        typeof t2.data?.error?.message === 'string',
      `status: ${t2.status}, error: ${t2.data?.error?.code}`
    );

    // -------------------------------------------------------------
    // 3. 9000-character topic
    // -------------------------------------------------------------
    const t3 = await dispatchRequest('POST', '/api/lesson', {
      topic: 'x'.repeat(9000),
      level: 'beginner',
    });
    report(
      '9000-character topic rejected (400 BAD_INPUT)',
      t3.status === 400 &&
        t3.data?.ok === false &&
        t3.data?.error?.code === 'BAD_INPUT' &&
        t3.data?.error?.message?.includes('between 3 and 8000'),
      `status: ${t3.status}, error: ${t3.data?.error?.code}`
    );

    // -------------------------------------------------------------
    // 4. Bad level
    // -------------------------------------------------------------
    const t4 = await dispatchRequest('POST', '/api/lesson', {
      topic: 'Cellular Respiration',
      level: 'ultra_advanced_wizard',
    });
    report(
      'Bad level rejected (400 BAD_INPUT)',
      t4.status === 400 &&
        t4.data?.ok === false &&
        t4.data?.error?.code === 'BAD_INPUT' &&
        t4.data?.error?.message?.includes('beginner, intermediate, or advanced'),
      `status: ${t4.status}, error: ${t4.data?.error?.code}`
    );

    // -------------------------------------------------------------
    // 5. Mocked AI: (a) JSON inside code fences
    // -------------------------------------------------------------
    __setMockGenerator(async () => {
      return `Here is the requested lesson in JSON format:\n\`\`\`json\n${JSON.stringify(validLessonPayload, null, 2)}\n\`\`\`\nHope this helps!`;
    });
    const t5 = await dispatchRequest('POST', '/api/lesson', {
      topic: 'Solar Energy',
      level: 'intermediate',
    });
    report(
      'Mocked AI (a): JSON inside markdown code fences parsed successfully (200 OK)',
      t5.status === 200 &&
        t5.data?.ok === true &&
        t5.data?.data?.sections?.length === 3,
      `status: ${t5.status}, ok: ${t5.data?.ok}`
    );

    // -------------------------------------------------------------
    // 6. Mocked AI: (b) Invalid JSON (retries once, then fails)
    // -------------------------------------------------------------
    let retryAttemptCount = 0;
    __setMockGenerator(async () => {
      retryAttemptCount++;
      return 'Response text that is definitely { not valid JSON: missing quotes and brackets';
    });
    const t6 = await dispatchRequest('POST', '/api/lesson', {
      topic: 'Quantum Physics',
      level: 'advanced',
    });
    report(
      'Mocked AI (b): Invalid JSON retries once and fails with 502 BAD_JSON',
      t6.status === 502 &&
        t6.data?.ok === false &&
        t6.data?.error?.code === 'BAD_JSON' &&
        retryAttemptCount === 2,
      `status: ${t6.status}, code: ${t6.data?.error?.code}, attempts: ${retryAttemptCount}`
    );

    // -------------------------------------------------------------
    // 7. Mocked AI: (c) Valid JSON with the wrong shape (retries once, then fails)
    // -------------------------------------------------------------
    let shapeAttemptCount = 0;
    __setMockGenerator(async () => {
      shapeAttemptCount++;
      return JSON.stringify({ unexpectedKey: 123, missingEverything: true });
    });
    const t7 = await dispatchRequest('POST', '/api/lesson', {
      topic: 'Neurobiology',
      level: 'beginner',
    });
    report(
      'Mocked AI (c): Valid JSON with wrong shape retries once and fails with 502 BAD_SHAPE',
      t7.status === 502 &&
        t7.data?.ok === false &&
        t7.data?.error?.code === 'BAD_SHAPE' &&
        shapeAttemptCount === 2,
      `status: ${t7.status}, code: ${t7.data?.error?.code}, attempts: ${shapeAttemptCount}`
    );

    // -------------------------------------------------------------
    // 8. Mocked AI: (d) Quiz where one question has answerIndex 9
    // -------------------------------------------------------------
    __setMockGenerator(async () => {
      return JSON.stringify({
        questions: [
          {
            id: 'q-1',
            sectionId: 'sec-1',
            question: 'What is the primary product of light-dependent reactions?',
            options: ['ATP and NADPH', 'Glucose only', 'Carbon Dioxide', 'Cellulose'],
            answerIndex: 0,
            explanation: 'Light reactions generate ATP and NADPH to power the Calvin Cycle.',
          },
          {
            id: 'q-2',
            sectionId: 'sec-1',
            question: 'This question contains an out-of-range answerIndex of 9.',
            options: ['Option A', 'Option B', 'Option C', 'Option D'],
            answerIndex: 9,
            explanation: 'Invalid index.',
          },
        ],
      });
    });
    const t8 = await dispatchRequest('POST', '/api/quiz', {
      lesson: {
        title: 'Photosynthesis',
        sections: [{ id: 'sec-1', heading: 'Light-Dependent Reactions' }],
      },
      count: 2,
    });
    const hasDroppedWarning =
      Array.isArray(t8.data?.warnings) &&
      t8.data.warnings.some((w) => w.toLowerCase().includes('dropped'));
    report(
      'Mocked AI (d): Quiz question with answerIndex 9 dropped and returned warning',
      t8.status === 200 &&
        t8.data?.ok === true &&
        t8.data?.data?.questions?.length === 1 &&
        hasDroppedWarning,
      `status: ${t8.status}, questions count: ${t8.data?.data?.questions?.length}, warnings: ${JSON.stringify(t8.data?.warnings)}`
    );

    // -------------------------------------------------------------
    // 9. Mocked AI: (e) Timeout
    // -------------------------------------------------------------
    let timeoutAttempts = 0;
    __setMockGenerator(async () => {
      timeoutAttempts++;
      throw new AppError('TIMEOUT', 'AI generation timed out after 30000ms.', 504);
    });
    const t9 = await dispatchRequest('POST', '/api/lesson', {
      topic: 'Slow Response Topic',
      level: 'beginner',
    });
    report(
      'Mocked AI (e): Timeout returns 504 TIMEOUT immediately without retrying',
      t9.status === 504 &&
        t9.data?.ok === false &&
        t9.data?.error?.code === 'TIMEOUT' &&
        timeoutAttempts === 1,
      `status: ${t9.status}, code: ${t9.data?.error?.code}, attempts: ${timeoutAttempts}`
    );

  } finally {
    __setMockGenerator(null);
  }

  console.log(`\n----------------------------------------------------------------`);
  console.log(` RESULTS: ${passed} passed, ${failed} failed (${passed + failed} total)`);
  console.log(`----------------------------------------------------------------\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runAllTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
