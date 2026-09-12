#!/usr/bin/env python3
"""Static file server for the portfolio with no-cache headers.

python -m http.server sends no Cache-Control, so browsers heuristically
cache data.js/app.js/index.html and a plain reload never re-fetches them.
This wrapper serves the same files but adds Cache-Control: no-cache to the
text assets (html/js/css) so every reload checks and gets the current
version. Images and other binary assets are left untouched.

Implementation note: SimpleHTTPRequestHandler calls guess_type() BEFORE
send_response(), so we cannot emit headers from guess_type (they'd land on
the status line). Instead guess_type() sets a flag, and end_headers() —
which is guaranteed to run after the status line has been written — sends
the Cache-Control header exactly once.
"""
import argparse
import http.server


NO_CACHE_TYPES = ("html", "javascript", "ecmascript", "css")


def handler_factory(directory):
    class Handler(http.server.SimpleHTTPRequestHandler):
        def __init__(self, *a, **kw):
            self.directory = directory
            super().__init__(*a, **kw)

        def guess_type(self, path):
            self._nc = True  # default: no-cache
            try:
                ctype = super().guess_type(path) or ""
            except Exception:
                ctype = "application/octet-stream"
            self._nc = any(t in ctype.lower() for t in NO_CACHE_TYPES)
            return ctype

        def end_headers(self):
            # send_response() has already written the status line; this is
            # the last chance to add to the header block. Only the first
            # call (the real response) sends the header — a send_error()
            # after a failed request must not be re-annotated.
            if self._nc:
                self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
            self._nc = False
            super().end_headers()

    return Handler


def main():
    p = argparse.ArgumentParser()
    p.add_argument("port", type=int, default=8098)
    p.add_argument("--bind", default="0.0.0.0")
    p.add_argument("--directory", default=".")
    a = p.parse_args()
    http.server.ThreadingHTTPServer((a.bind, a.port), handler_factory(a.directory)).serve_forever()


if __name__ == "__main__":
    main()
