const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const PROTO_PATH = path.join(__dirname, 'proto', 'rate_limiter.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const proto = grpc.loadPackageDefinition(packageDefinition).ratelimiter;

// Connect to the rate limiter service — in real life this URL would come from
// service discovery / env config, not hardcoded
const client = new proto.RateLimiter(
  'localhost:50051',
  grpc.credentials.createInsecure(),
);

function checkLimit(key) {
  return new Promise((resolve, reject) => {
    client.CheckLimit({ key }, (err, response) => {
      if (err) return reject(err);
      resolve(response);
    });
  });
}

async function simulateRequest(userKey, requestNum) {
  try {
    const result = await checkLimit(userKey);
    const status = result.allowed ? '✅ ALLOWED' : '❌ DENIED';
    console.log(
      `Request #${requestNum} [key=${userKey}] → ${status} | remaining=${result.remaining} | checked=${result.checked} | retryAfterMs=${result.retryAfterMs}`,
    );
  } catch (err) {
    console.error(
      `Request #${requestNum} FAILED to reach rate limiter:`,
      err.message,
    );
  }
}

async function main() {
  const userKey = process.argv[2] || 'test-user';
  const numRequests = parseInt(process.argv[3] || '15', 10);

  console.log(
    `Simulating ${numRequests} sequential requests for key="${userKey}"\n`,
  );

  for (let i = 1; i <= numRequests; i++) {
    await simulateRequest(userKey, i);
    await new Promise((r) => setTimeout(r, 200)); // small delay so you can read output
  }
}

main();
