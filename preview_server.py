"""Preview single-origin: sajikan frontend/dist statis, teruskan API ke Flask :8000."""
import http.server, http.client, urllib.parse, os

DIST = os.path.expanduser("~/workspace/metpen-newest/frontend/dist")
API_HOST, API_PORT = "127.0.0.1", 8000

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=DIST, **kw)

    def log_message(self, *a):
        pass

    def _proxy(self):
        conn = http.client.HTTPConnection(API_HOST, API_PORT, timeout=30)
        panjang = int(self.headers.get("Content-Length", 0) or 0)
        body = self.rfile.read(panjang) if panjang else None
        kepala = {k: v for k, v in self.headers.items()
                  if k.lower() not in ("host", "content-length")}
        conn.request(self.command, self.path, body=body, headers=kepala)
        resp = conn.getresponse()
        data = resp.read()
        self.send_response(resp.status)
        for k, v in resp.getheaders():
            if k.lower() not in ("content-length", "transfer-encoding"):
                self.send_header(k, v)
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)
        conn.close()

    def do_GET(self):
        rute = urllib.parse.urlparse(self.path).path
        if rute == "/":
            self.path = "/index.html"
            return super().do_GET()
        # API GET yang dikenal: teruskan ke Flask, KECUALI navigasi browser
        # langsung (Accept: text/html) yang harus dapat SPA index.html.
        # (POST /rekomendasi ditangani do_POST.)
        seg = rute.split("/")[1]
        terima = self.headers.get("Accept", "")
        if seg in ("auth", "profil", "skills", "skill", "pekerjaan",
                   "quest", "riwayat") and "text/html" not in terima:
            return self._proxy()
        if os.path.exists(os.path.join(DIST, rute.lstrip("/"))):
            return super().do_GET()
        self.path = "/index.html"
        return super().do_GET()

    do_POST = do_PUT = do_DELETE = do_PATCH = _proxy

http.server.ThreadingHTTPServer(("127.0.0.1", 18080), Handler).serve_forever()
