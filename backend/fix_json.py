import json
import re

with open('data/cyberguard_dataset.json', encoding='utf-8') as f:
    content = f.read()

content = re.sub(r'\]\s*\[', ',', content)

def clean_escapes(s):
    out = []
    i = 0
    while i < len(s):
        if s[i] == '\\' and i + 1 < len(s):
            if s[i+1] in ('"', '\\', '/', 'b', 'f', 'n', 'r', 't', 'u'):
                out.append(s[i])
                out.append(s[i+1])
                i += 2
            else:
                i += 1
        else:
            out.append(s[i])
            i += 1
    return ''.join(out)

content = clean_escapes(content)
content = content.replace('{"__proto__": {"isAdmin": true}}', '{__proto__: {isAdmin: true}}')
content = content.strip()

# Hapus trailing comma
content = re.sub(r',\s*\]', ']', content)
content = re.sub(r',\s*\}', '}', content)

try:
    data = json.loads(content)
    print(f'Berhasil! Total: {len(data)}')
    with open('data/cyberguard_dataset.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print('Selesai!')
except json.JSONDecodeError as e:
    pos = e.pos
    print(f'Masih error di posisi {pos}')
    print(f'Konteks: ...{repr(content[pos-50:pos+50])}...')