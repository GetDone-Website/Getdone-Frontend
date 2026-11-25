#!/usr/bin/env python3
"""Konversi fragmen HTML (isi <body>) ke JSX, mempertahankan class/struktur apa adanya."""
import re, sys, html
from html.parser import HTMLParser

VOID = {"area","base","br","col","embed","hr","img","input","link","meta","source","track","wbr"}
ATTR = {"class":"className","for":"htmlFor","tabindex":"tabIndex","readonly":"readOnly","maxlength":"maxLength",
        "minlength":"minLength","autocomplete":"autoComplete","colspan":"colSpan","rowspan":"rowSpan",
        "crossorigin":"crossOrigin","autofocus":"autoFocus","enctype":"encType","novalidate":"noValidate",
        "contenteditable":"contentEditable","srcset":"srcSet","datetime":"dateTime","inputmode":"inputMode"}
BOOL = {"disabled","required","checked","selected","readonly","hidden","multiple","autofocus","novalidate","open"}
SVG_ATTR = re.compile(r"^(stroke|fill|clip|font|text|stop|flood|color|marker|shape|vector|paint|pointer|letter|word|dominant|alignment|baseline|enable|image|lighting|glyph)-(.+)$")

def camel(s): 
    p = s.split("-"); return p[0] + "".join(x.capitalize() for x in p[1:])

def style_obj(v):
    items = []
    for d in filter(None, (x.strip() for x in v.split(";"))):
        if ":" not in d: continue
        k, val = d.split(":", 1); k = k.strip(); val = val.strip()
        k = k if k.startswith("--") else camel(k)
        items.append(f'"{k}": {repr(val).replace(chr(39), chr(34)) if False else chr(34)+val.replace(chr(34), chr(39))+chr(34)}')
    return "{{" + ", ".join(items) + "}}"

def esc_text(t):
    t = t.replace("{", "{'{'}").replace("}", "{'}'}")
    return t

LINKS = {"index.html":"/","login.html":"/login","register.html":"/register","onboarding.html":"/onboarding",
         "dashboard.html":"/dashboard","courses.html":"/courses","tasks.html":"/tasks","analytics.html":"/analytics","profile.html":"/profile"}

class P(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=False)
        self.out = []; self.skip = 0; self.stack = []
    def handle_starttag(self, tag, attrs):
        if tag in ("script",): self.skip += 1; return
        if self.skip: return
        self.out.append(self.open(tag, attrs, tag in VOID))
        if tag not in VOID: self.stack.append((tag, self.last_emitted))
    def handle_startendtag(self, tag, attrs):
        if self.skip: return
        self.out.append(self.open(tag, attrs, True))
    def open(self, tag, attrs, selfclose):
        parts = []
        emitted = tag
        if tag == "a":
            href = dict(attrs).get("href") or ""
            if href in LINKS:
                emitted = "Link"
                attrs = [("to", LINKS[href]) if k == "href" else (k, v) for k, v in attrs]
        self.last_emitted = emitted
        for k, v in attrs:
            lk = k.lower()
            if lk.startswith("on"): continue
            if lk == "checked" and tag == "input": parts.append("defaultChecked"); continue
            if lk == "value" and tag == "input": parts.append(f'defaultValue="{html.unescape(v or "")}"'); continue
            if lk == "selected" and tag == "option": continue
            if k == "to": parts.append(f'to="{v}"'); continue  # handler inline dibuang; di-wire manual di React
            if lk == "style": parts.append(f"style={style_obj(v or '')}"); continue
            name = ATTR.get(lk)
            if not name:
                m = SVG_ATTR.match(lk)
                if m: name = camel(lk)
                elif lk == "viewbox": name = "viewBox"
                elif lk.startswith(("data-","aria-")): name = lk
                elif lk == "xmlns:xlink": name = "xmlnsXlink"
                elif lk == "xlink:href": name = "xlinkHref"
                else: name = lk
            if v is None or (lk in BOOL and v in ("", lk)):
                parts.append(name); continue
            v = html.unescape(v)
            if name in ("value","defaultValue") : pass
            if '"' in v: parts.append(f"{name}={{{repr(v)}}}")
            elif "{" in v or "\n" in v: parts.append(f"{name}={{`{v}`}}")
            else: parts.append(f'{name}="{v}"')
        a = (" " + " ".join(parts)) if parts else ""
        return f"<{emitted}{a}{' /' if selfclose else ''}>"
    def handle_endtag(self, tag):
        if tag == "script": self.skip = max(0, self.skip-1); return
        if self.skip or tag in VOID: return
        emitted = tag
        if self.stack and self.stack[-1][0] == tag: emitted = self.stack.pop()[1]
        self.out.append(f"</{emitted}>")
    def handle_data(self, d):
        if not self.skip: self.out.append(esc_text(d))
    def handle_entityref(self, n):
        if not self.skip: self.out.append(f"&{n};")
    def handle_charref(self, n):
        if not self.skip: self.out.append(f"&#{n};")
    def handle_comment(self, d):
        if not self.skip: self.out.append("{/*" + d.replace("*/","* /") + "*/}")

def body_of(src):
    m = re.search(r"<body[^>]*>(.*)</body>", src, re.S | re.I)
    return m.group(1) if m else src

def convert(path):
    p = P(); p.feed(body_of(open(path, encoding="utf-8").read())); return "".join(p.out)

if __name__ == "__main__":
    print(convert(sys.argv[1]))
