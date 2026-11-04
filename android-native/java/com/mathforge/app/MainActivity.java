package com.mathforge.app;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.res.AssetManager;
import android.os.Build;
import android.os.Bundle;
import android.view.KeyEvent;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import java.io.BufferedInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.InetAddress;
import java.net.ServerSocket;
import java.net.Socket;
import java.net.URLDecoder;
import java.util.HashMap;
import java.util.Map;

/**
 * 轻量 WebView 壳。
 * Vite 产出的是 ES module，file:// 下会被 CORS 拦成白屏，
 * 所以在应用内起一个只监听 127.0.0.1 的极简 HTTP 服务托管 assets。
 */
public class MainActivity extends Activity {
    private WebView webView;
    private LocalServer server;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        webView = new WebView(this);
        WebSettings s = webView.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(false);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            s.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        }
        webView.setWebViewClient(new ErrorClient());
        setContentView(webView);

        try {
            server = new LocalServer(getAssets(), "public");
            server.start();
            webView.loadUrl("http://127.0.0.1:" + server.getPort() + "/index.html");
        } catch (IOException e) {
            webView.loadData("<h3>资源服务启动失败</h3><pre>" + e + "</pre>", "text/html", "utf-8");
        }
    }

    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        if (keyCode == KeyEvent.KEYCODE_BACK && webView != null && webView.canGoBack()) {
            webView.goBack();
            return true;
        }
        return super.onKeyDown(keyCode, event);
    }

    @Override
    protected void onDestroy() {
        if (server != null) server.stop();
        super.onDestroy();
    }

    /** 加载失败时显示可读信息，而不是白屏（独立类，避免 d8 处理匿名内部类出错） */
    private static class ErrorClient extends WebViewClient {
        @Override
        public void onReceivedError(WebView view, int errorCode, String description, String failingUrl) {
            view.loadData("<h3>加载失败</h3><p>" + description + "</p><p>" + failingUrl + "</p>",
                    "text/html", "utf-8");
        }
    }

    /** 只服务 APK 内 assets/<root>/ 的静态文件 */
    static class LocalServer implements Runnable {
        private static final Map<String, String> MIME = new HashMap<>();

        static {
            MIME.put("html", "text/html; charset=utf-8");
            MIME.put("js", "text/javascript; charset=utf-8");
            MIME.put("mjs", "text/javascript; charset=utf-8");
            MIME.put("css", "text/css; charset=utf-8");
            MIME.put("json", "application/json; charset=utf-8");
            MIME.put("svg", "image/svg+xml");
            MIME.put("png", "image/png");
            MIME.put("jpg", "image/jpeg");
            MIME.put("webp", "image/webp");
            MIME.put("ico", "image/x-icon");
            MIME.put("woff", "font/woff");
            MIME.put("woff2", "font/woff2");
            MIME.put("ttf", "font/ttf");
            MIME.put("map", "application/json");
        }

        private final AssetManager assets;
        private final String root;
        private ServerSocket socket;
        private volatile boolean running = true;
        private Thread thread;

        LocalServer(AssetManager assets, String root) {
            this.assets = assets;
            this.root = root;
        }

        void start() throws IOException {
            socket = new ServerSocket(0, 16, InetAddress.getByName("127.0.0.1"));
            thread = new Thread(this, "mf-assets");
            thread.start();
        }

        int getPort() {
            return socket.getLocalPort();
        }

        void stop() {
            running = false;
            try {
                if (socket != null) socket.close();
            } catch (IOException ignored) {
            }
        }

        @Override
        public void run() {
            while (running) {
                try {
                    Socket client = socket.accept();
                    handle(client);
                } catch (IOException e) {
                    if (running) e.printStackTrace();
                }
            }
        }

        private void handle(Socket client) {
            try (Socket c = client) {
                InputStream in = new BufferedInputStream(c.getInputStream());
                String head = readLine(in);
                if (head == null || head.isEmpty()) return;
                String[] parts = head.split(" ");
                if (parts.length < 2) return;
                String path = URLDecoder.decode(parts[1], "UTF-8");
                int q = path.indexOf('?');
                if (q >= 0) path = path.substring(0, q);
                if (path.startsWith("/")) path = path.substring(1);
                if (path.isEmpty()) path = "index.html";

                byte[] body = readAsset(path);
                if (body == null) {
                    body = readAsset("index.html");
                    path = "index.html";
                }
                String mime = guessMime(path);
                OutputStream out = c.getOutputStream();
                if (body == null) {
                    out.write(("HTTP/1.1 404 Not Found\r\nContent-Length: 0\r\nConnection: close\r\n\r\n").getBytes("UTF-8"));
                } else {
                    String header = "HTTP/1.1 200 OK\r\n"
                            + "Content-Type: " + mime + "\r\n"
                            + "Content-Length: " + body.length + "\r\n"
                            + "Cache-Control: no-cache\r\n"
                            + "Connection: close\r\n\r\n";
                    out.write(header.getBytes("UTF-8"));
                    out.write(body);
                }
                out.flush();
            } catch (IOException ignored) {
            }
        }

        private byte[] readAsset(String path) {
            InputStream is = null;
            try {
                is = assets.open(root + "/" + path);
                ByteArrayOutputStream bos = new ByteArrayOutputStream();
                byte[] buf = new byte[8192];
                int n;
                while ((n = is.read(buf)) > 0) bos.write(buf, 0, n);
                return bos.toByteArray();
            } catch (IOException e) {
                return null;
            } finally {
                if (is != null) try { is.close(); } catch (IOException ignored) {}
            }
        }

        private static String guessMime(String path) {
            int dot = path.lastIndexOf('.');
            if (dot < 0) return "application/octet-stream";
            String ext = path.substring(dot + 1).toLowerCase();
            String mime = MIME.get(ext);
            return mime != null ? mime : "application/octet-stream";
        }

        private static String readLine(InputStream in) throws IOException {
            StringBuilder sb = new StringBuilder();
            int b;
            while ((b = in.read()) != -1) {
                if (b == '\n') break;
                if (b != '\r') sb.append((char) b);
                if (sb.length() > 4096) break;
            }
            return sb.length() == 0 ? null : sb.toString();
        }
    }
}
