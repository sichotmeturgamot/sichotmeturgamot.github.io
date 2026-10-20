import pdfplumber,re,json,sys
sys.path.insert(0,'.')
from dec import dec
F='/root/.claude/uploads/2db437d0-c894-5396-96c1-9a847b531ee5/0a737336-_________________________._______________________.pdf'
pages=[]
with pdfplumber.open(F) as pdf:
    for i,pg in enumerate(pdf.pages):
        body=pg.filter(lambda o: o.get('object_type')!='char' or 10.0<=o.get('size',0)<=10.6)
        txt=body.extract_text(x_tolerance=1.5) or ''
        hdr=pg.filter(lambda o: o.get('object_type')!='char' or o.get('size',0)>=10.8).extract_text(x_tolerance=1.5) or ''
        lines=[dec(l) for l in txt.split('\n') if l.strip()]
        pages.append({'pdf':i+1,'hdr':[dec(l) for l in hdr.split('\n') if l.strip()],'lines':lines})
json.dump(pages,open('pages.json','w'),ensure_ascii=False,indent=0)
