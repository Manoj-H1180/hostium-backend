const functionRegexes = {
  javascript: /function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/,
  python: /def\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/,
  java: /(?:public|private|protected|static|\s) +[\w\<\>\[\]]+\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/,
  cpp: /(?:[\w\<\>\[\]]+\s+)+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/,
  c: /(?:[\w\[\]]+\s+)+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/,
};

module.exports = { functionRegexes };
