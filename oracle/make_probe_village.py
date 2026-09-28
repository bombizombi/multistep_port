import io

p = 'oracle/runner/_probe-driver.js'
s = open(p, encoding='utf8', newline='').read()
old = """  const where = (stack[3] || "").trim().split(" ").pop() || "?"; // caller of uniformRandomInteger
  console.log("DRAW", rngDraws, where.replace(/^.*js[/\\\\]/, ""));"""
new = """  const vframe = stack.find((f) => /village\\.js/.test(f) && /map|fauna|create/i.test(f)) || stack[3] || "";
  console.log("DRAW", rngDraws, (vframe.trim().split(" ").pop() || "?").replace(/^.*js[/\\\\]/, ""));"""
assert old in s, "emit"
s = s.replace(old, new)
open(p, 'w', encoding='utf8', newline='\n').write(s)
print('probe v10')
