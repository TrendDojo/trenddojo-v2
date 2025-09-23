const fs = require('fs');

const content = fs.readFileSync('/Users/duncanmcgill/coding/trenddojo-v2/src/app/positions/page.tsx', 'utf8');
const lines = content.split('\n');

// Track opening and closing tags
let depth = 0;
let inPageContent = false;
let pageContentStartLine = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const lineNum = i + 1;

  if (line.includes('<PageContent>')) {
    inPageContent = true;
    pageContentStartLine = lineNum;
    console.log(`Line ${lineNum}: <PageContent> OPENED`);
    depth = 1;
  } else if (line.includes('</PageContent>')) {
    console.log(`Line ${lineNum}: </PageContent> CLOSED`);
    console.log(`PageContent spans lines ${pageContentStartLine}-${lineNum}`);
    inPageContent = false;
  } else if (inPageContent) {
    // Count JSX depth changes
    if (lineNum === 639) console.log(`Line 639: ternary ? branch`);
    if (lineNum === 663) console.log(`Line 663: ternary : branch`);
    if (lineNum === 671) console.log(`Line 671: ternary closing )`);
    if (lineNum === 674) console.log(`Line 674: conditional && (`);
    if (lineNum === 675) console.log(`Line 675: <> fragment opened`);
    if (lineNum === 1352) console.log(`Line 1352: </> fragment closed`);
    if (lineNum === 1353) console.log(`Line 1353: ) conditional closed`);
    if (lineNum === 1356) console.log(`Line 1356: NewPositionModal`);
    if (lineNum === 1364) console.log(`Line 1364: showIndicatorKey && (`);
    if (lineNum === 1519) console.log(`Line 1519: ) showIndicatorKey closed`);
  }
}