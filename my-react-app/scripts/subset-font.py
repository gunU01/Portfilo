"""나눔스퀘어 네오(가변 woff2)를 웹용으로 둘로 쪼갭니다. 사이트 문구를 바꾼 뒤 다시 돌리세요.

  pip install fonttools brotli
  python3 scripts/subset-font.py <원본 NanumSquareNeo-Variable.woff2>

- NanumSquareNeo-a.woff2: 지금 사이트(src, index.html)에서 쓰는 글자 + 영문/숫자. 항상 받습니다.
- NanumSquareNeo-b.woff2: 완성형 한글 2,350자 + KS X 1001 기호. 문구를 새로 쓰다 a 에 없는 글자가 나올 때만 받습니다.
- src/styles/font.css: 위 두 파일의 @font-face (a 의 unicode-range 는 여기서 새로 씁니다).
글꼴 라이선스: SIL Open Font License 1.1 (NAVER Corp.)
"""
import glob
import os
import sys

from fontTools import subset
from fontTools.ttLib import TTFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'src', 'assets', 'fonts')


def euc_kr(his, los):
    out = set()
    for hi in his:
        for lo in los:
            try:
                out.add(bytes([hi, lo]).decode('euc-kr'))
            except UnicodeDecodeError:
                pass
    return out


def ranges(codes):
    codes = sorted(codes)
    out, start, prev = [], codes[0], codes[0]
    for c in codes[1:]:
        if c != prev + 1:
            out.append((start, prev))
            start = c
        prev = c
    out.append((start, prev))
    return ', '.join(f'U+{a:X}' if a == b else f'U+{a:X}-{b:X}' for a, b in out)


def write_subset(src, chars, path):
    font = TTFont(src)
    opts = subset.Options()
    opts.flavor = 'woff2'
    opts.layout_features = ['*']
    opts.notdef_outline = True
    opts.name_IDs = ['*']
    s = subset.Subsetter(opts)
    s.populate(text=''.join(sorted(chars)))
    s.subset(font)
    font.flavor = 'woff2'
    font.save(path)
    print(os.path.basename(path), os.path.getsize(path) // 1024, 'KB')


def main(src):
    used = set()
    for f in glob.glob(os.path.join(ROOT, 'src', '**', '*.js*'), recursive=True) + glob.glob(os.path.join(ROOT, 'src', '**', '*.css'), recursive=True) + [os.path.join(ROOT, 'index.html')]:
        with open(f, encoding='utf8') as fh:
            used |= set(fh.read())
    ascii_ = {chr(c) for c in range(0x20, 0x7F)}
    a = {c for c in used | ascii_ | set('‘’“”–—·…→↓↗×※©') if c >= ' ' and c not in '\x7f'}
    b = euc_kr(range(0xB0, 0xC9), range(0xA1, 0xFF)) | euc_kr(range(0xA1, 0xAF), range(0xA1, 0xFF))
    font_chars = set(TTFont(src).getBestCmap())
    a = {c for c in a if ord(c) in font_chars and c not in '\n\r\t'}

    os.makedirs(OUT, exist_ok=True)
    write_subset(src, a, os.path.join(OUT, 'NanumSquareNeo-a.woff2'))
    write_subset(src, b, os.path.join(OUT, 'NanumSquareNeo-b.woff2'))

    css = f"""/* scripts/subset-font.py 가 만든 파일입니다. 직접 고치지 마세요. */
/* b(전체 완성형 한글)를 먼저 선언하고, 지금 쓰는 글자만 담은 a 를 나중에 선언해 a 가 우선하게 합니다. */
@font-face {{
  font-family: 'NanumSquareNeo';
  src: url('../assets/fonts/NanumSquareNeo-b.woff2') format('woff2');
  font-weight: 100 900;
  font-display: swap;
  unicode-range: U+AC00-D7A3, U+2000-206F, U+2190-21FF, U+2200-22FF, U+2460-24FF, U+25A0-25FF, U+3000-303F, U+3130-318F, U+FF00-FFEF;
}}
@font-face {{
  font-family: 'NanumSquareNeo';
  src: url('../assets/fonts/NanumSquareNeo-a.woff2') format('woff2');
  font-weight: 100 900;
  font-display: swap;
  unicode-range: {ranges({ord(c) for c in a})};
}}
"""
    with open(os.path.join(ROOT, 'src', 'styles', 'font.css'), 'w', encoding='utf8') as fh:
        fh.write(css)


if __name__ == '__main__':
    main(sys.argv[1])
