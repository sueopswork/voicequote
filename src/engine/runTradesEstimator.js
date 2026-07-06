export function runTradeEstimator(speechText) {
const lowerText = speechText.toLowerCase();

let client = "Valued Customer";
let job = "General Trade Works";
let items = [];
let notes =
"Estimates are based on standard UK trade rates and initial verbal brief.";

// Name extraction
const namePatterns = [
/for\s+(mr\s+[a-z]+|mrs\s+[a-z]+|miss\s+[a-z]+|[a-z]+)/i,
/client\s+([a-z]+(\s+[a-z]+)?)/i,
/customer\s+([a-z]+(\s+[a-z]+)?)/i,
];

for (const pattern of namePatterns) {
const match = lowerText.match(pattern);
if (match && match[1]) {
client = match[1].replace(/\b\w/g, (l) => l.toUpperCase());
break;
}
}

if (
lowerText.includes("leak") ||
lowerText.includes("plumb") ||
lowerText.includes("tap") ||
lowerText.includes("toilet") ||
lowerText.includes("pipe")
) {
job = "Emergency Plumbing & Repair";
items = [
{ description: "Call-out & inspection", cost: 85 },
{ description: "Repair labour & sealing", cost: 115 },
{ description: "Materials", cost: 35 },
];
} else if (
lowerText.includes("paint") ||
lowerText.includes("wall") ||
lowerText.includes("decorat")
) {
job = "Interior Decorating";
items = [
{ description: "Prep & sanding", cost: 120 },
{ description: "Painting labour", cost: 180 },
{ description: "Materials", cost: 45 },
];
} else {
job = "General Handyman Work";
items = [
{ description: "Labour & assessment", cost: 125 },
{ description: "Basic materials", cost: 45 },
];
}

const total = items.reduce((a, b) => a + b.cost, 0);

return { client, job, items, total, notes };
}
