import http.server,socketserver
class H(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control","public, max-age=600"); super().end_headers()
socketserver.TCPServer.allow_reuse_address=True
socketserver.TCPServer(("",8766),H).serve_forever()
