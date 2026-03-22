const fs = require('fs');
const path = 'c:/Users/visha/OneDrive/Desktop/Prism/PRISM/frontend/src/app/admin/match/[match_id]/page.tsx';
const text = fs.readFileSync(path, 'utf8');
const lines = text.split(/\r?\n/);
const tagMaybe = /<(\/?)([A-Za-z_][A-Za-z0-9_]*)([^>]*)>/g;
let stack = [];
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  let m;
  while ((m = tagMaybe.exec(line)) !== null) {
    const isClose = m[1] === '/';
    const tag = m[2];
    const full = m[0];
    if (isClose) {
      if (stack.length && stack[stack.length - 1].tag === tag) {
        stack.pop();
      } else {
        console.log('unmatched close', tag, 'at line', i + 1);
      }
    } else if (full.endsWith('/>') || ['input','img','br','hr','meta','link'].includes(tag)) {
      // self-closing, ignore
    } else {
      stack.push({tag, line: i + 1});
    }
  }
}
console.log('stack size', stack.length);
console.log('top 20 stack entries (unclosed tags):');
stack.slice(-20).forEach(x => console.log(x.tag, x.line));
