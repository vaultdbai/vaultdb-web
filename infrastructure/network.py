import socket
import threading
import json


class Server:
    """
    VaultDB Network Server
    Simple TCP server that listens for client connections and handles requests.

    Usage:
        server = Server(host="localhost", port=5432)
        server.start()
    """

    def __init__(self, host: str = "localhost", port: int = 5432, max_connections: int = 10):
        self.host = host
        self.port = port
        self.max_connections = max_connections
        self._running = False
        self._socket = None

    def start(self) -> None:
        """Start the server and listen for connections."""
        self._socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self._socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        self._socket.bind((self.host, self.port))
        self._socket.listen(self.max_connections)
        self._running = True
        print(f"[Server] VaultDB listening on {self.host}:{self.port}")

        while self._running:
            try:
                conn, addr = self._socket.accept()
                thread = threading.Thread(target=self._handle_client, args=(conn, addr))
                thread.daemon = True
                thread.start()
            except OSError:
                break

    def _handle_client(self, conn: socket.socket, addr: tuple) -> None:
        """Handle an individual client connection."""
        print(f"[Server] Client connected: {addr}")
        try:
            while True:
                data = conn.recv(4096)
                if not data:
                    break
                response = self._process(data.decode("utf-8"))
                conn.sendall(response.encode("utf-8"))
        except Exception as e:
            print(f"[Server] Error with client {addr}: {e}")
        finally:
            conn.close()
            print(f"[Server] Client disconnected: {addr}")

    def _process(self, raw: str) -> str:
        """Process incoming request and return a response."""
        try:
            request = json.loads(raw)
            action = request.get("action", "unknown")
            return json.dumps({"status": "ok", "action": action, "message": f"Received: {action}"})
        except json.JSONDecodeError:
            return json.dumps({"status": "error", "message": "Invalid JSON"})

    def stop(self) -> None:
        """Stop the server."""
        self._running = False
        if self._socket:
            self._socket.close()
        print("[Server] Stopped")


class Client:
    """
    VaultDB Network Client
    Connects to a VaultDB server and sends requests.

    Usage:
        client = Client(host="localhost", port=5432)
        client.connect()
        response = client.send({"action": "query", "collection": "users"})
        client.disconnect()
    """

    def __init__(self, host: str = "localhost", port: int = 5432):
        self.host = host
        self.port = port
        self._socket = None

    def connect(self) -> None:
        """Connect to the VaultDB server."""
        self._socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self._socket.connect((self.host, self.port))
        print(f"[Client] Connected to {self.host}:{self.port}")

    def send(self, request: dict) -> dict:
        """Send a request and return the response."""
        if not self._socket:
            raise Exception("Not connected. Call connect() first.")
        self._socket.sendall(json.dumps(request).encode("utf-8"))
        data = self._socket.recv(4096)
        return json.loads(data.decode("utf-8"))

    def disconnect(self) -> None:
        """Disconnect from the server."""
        if self._socket:
            self._socket.close()
            self._socket = None
        print("[Client] Disconnected")

    def __repr__(self) -> str:
        return f"<Client host={self.host} port={self.port}>"
