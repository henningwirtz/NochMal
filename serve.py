#!/usr/bin/env python3
# Lokaler Entwicklungs-Server fuer NOCH MAL!, der das Caching abschaltet.
# So zeigt der Browser nach jedem Update zuverlaessig die aktuelle Version.
import http.server
import socketserver

PORT = 8000


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()


if __name__ == "__main__":
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), NoCacheHandler) as httpd:
        print(f"NOCH MAL! laeuft auf http://localhost:{PORT}/ (Caching deaktiviert)")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            pass
