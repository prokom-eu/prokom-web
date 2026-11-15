# v23: tła miniatur rozwiązań neutralne (papier PRO-KOM) zamiast pastelowych kolorów kategorii
import glob, os
R = os.path.dirname(os.path.abspath(__file__))
M = {}
for c in ['EFE9FC', 'E6EEFC', 'E4F3F1', 'FCF1E2', 'E7F4E2']: M[c] = 'F2F3EF'
for c in ['DCCEFA', 'CCDCF8', 'C9E7E2', 'F5DDBA', 'CDE8C3']: M[c] = 'E3E6DE'
for c in ['5DB7AC', '7EA6E6', '77BE66', 'A98BF0', 'E6A65A']: M[c] = 'B9B0D6'
n = 0
for f in glob.glob(os.path.join(R, 'project', '*.dc.html')):
    s = open(f, encoding='utf-8').read(); o = s
    for a, b in M.items():
        s = s.replace("stop-color='%23" + a + "'", "stop-color='%23" + b + "'").replace("r='70' fill='%23" + a + "'", "r='70' fill='%23" + b + "'")
    if s != o: open(f, 'w', encoding='utf-8').write(s); n += 1
print('thumbs', n)
