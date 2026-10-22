# בניית search-bits.bin — גרסה מכווצת (ביט לכל ממד: חיובי/לא) של כל הווקטורים, לסינון ראשוני מהיר בשרת
# מבנה: <II N,dim> ואחריו N שורות של dim/8 בתים (סדר ביטים: הביט הגבוה ראשון, כמו numpy.packbits)
import struct, numpy as np, os
R = os.path.dirname(os.path.abspath(__file__)) + '/../'
b = open(R + 'search-vectors.bin', 'rb').read()
N, dim, np_, dl = struct.unpack('<IIII', b[:16])
V = np.frombuffer(b, np.int8, offset=16 + 2 * N).reshape(N, dim)
B = np.packbits(V > 0, axis=1)
with open(R + 'search-bits.bin', 'wb') as f:
    f.write(struct.pack('<II', N, dim)); f.write(B.tobytes())
print('bits', N, dim, os.path.getsize(R + 'search-bits.bin'))
