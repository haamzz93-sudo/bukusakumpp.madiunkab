<?php

// Autoloader sederhana atau composer
if (file_exists(__DIR__ . '/../vendor/autoload.php')) {
    require_once __DIR__ . '/../vendor/autoload.php';
} else {
    spl_autoload_register(function ($class) {
        $prefix = 'App\\';
        $base_dir = __DIR__ . '/../app/';
        $len = strlen($prefix);
        if (strncmp($prefix, $class, $len) !== 0) {
            return;
        }
        $relative_class = substr($class, $len);
        $file = $base_dir . str_replace('\\', '/', $relative_class) . '.php';
        if (file_exists($file)) {
            require_once $file;
        }
    });
}

use App\Http\Controllers\Api\ChatController;
use App\Services\GuardrailService;
use App\Services\RagSearchService;
use App\Services\Database;

$uri = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);

// CORS Headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Accept, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 0. AUTHENTICATION & REAL CAPTCHA API (SQLite Database Users)
if ($uri === '/api/auth/captcha') {
    header('Content-Type: application/json');
    $captcha = Database::generateCaptcha();
    echo json_encode(['ok' => true, 'captcha' => $captcha]);
    exit();
}

if ($uri === '/api/auth/login') {
    header('Content-Type: application/json');
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true) ?? [];

    $username = trim($data['username'] ?? '');
    $password = trim($data['password'] ?? '');
    $captchaToken = trim($data['captchaToken'] ?? '');
    $captchaCode = trim($data['captchaCode'] ?? '');

    if (empty($username) || empty($password)) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'error' => 'Username dan password wajib diisi']);
        exit();
    }

    if (empty($captchaToken) || empty($captchaCode)) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'error' => 'Kode Captcha wajib diisi']);
        exit();
    }

    if (!Database::verifyCaptcha($captchaToken, $captchaCode)) {
        http_response_code(401);
        echo json_encode(['ok' => false, 'error' => 'Kode Captcha tidak cocok atau telah kedaluwarsa. Silakan refresh captcha.']);
        exit();
    }

    $user = Database::authenticate($username, $password);
    if (!$user) {
        http_response_code(401);
        echo json_encode(['ok' => false, 'error' => 'Username atau password salah']);
        exit();
    }

    echo json_encode([
        'ok' => true,
        'message' => 'Login berhasil!',
        'user' => $user
    ]);
    exit();
}

if ($uri === '/api/auth/users') {
    header('Content-Type: application/json');
    $users = Database::getUsers();
    echo json_encode(['ok' => true, 'users' => $users]);
    exit();
}

if ($uri === '/api/auth/password' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    header('Content-Type: application/json');
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true) ?? [];
    $username = trim($data['username'] ?? '');
    $newPassword = trim($data['newPassword'] ?? '');
    if ($username && strlen($newPassword) >= 6) {
        Database::updateUserPassword($username, $newPassword);
        echo json_encode(['ok' => true, 'message' => 'Password berhasil diperbarui']);
        exit();
    }
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Password minimal 6 karakter']);
    exit();
}

// 1. CHAT WITH AI & PDF RAG (Records Real Question to Database)
if ($uri === '/api/chat' || $uri === '/tanya/chat') {
    $rawInput = file_get_contents('php://input');
    $inputData = json_decode($rawInput, true) ?? [];
    $userQuery = trim($inputData['q'] ?? $inputData['query'] ?? '');
    if (!empty($userQuery)) {
        Database::recordEvent('tanya_ai', 'Warga bertanya: "' . mb_substr($userQuery, 0, 60) . (mb_strlen($userQuery) > 60 ? '...' : '') . '"');
    }

    $guardrail = new GuardrailService();
    $rag = new RagSearchService();
    $controller = new ChatController($guardrail, $rag);
    $controller->chat();
    exit();
}

// 2. REAL VISITOR TELEMETRY TRACKING (Saved into SQLite visitor_logs)
if ($uri === '/api/track') {
    header('Content-Type: application/json');
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true) ?? [];
    $type = $data['type'] ?? 'visit';
    $desc = $data['desc'] ?? 'Kunjungan Halaman Web MPP';
    Database::recordEvent($type, $desc);
    echo json_encode(['ok' => true]);
    exit();
}

// 3. REAL VISITOR AUDIT LOGS (Querying SQLite visitor_logs)
if ($uri === '/api/logs') {
    header('Content-Type: application/json');
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 100;
    $type = isset($_GET['type']) ? trim($_GET['type']) : null;
    $logs = Database::getLogs($limit, $type);
    echo json_encode(['ok' => true, 'total' => count($logs), 'logs' => $logs]);
    exit();
}

// 4. REAL STATS & ANALYTICS (Aggregated from SQLite)
if ($uri === '/api/stats') {
    header('Content-Type: application/json');
    echo json_encode(Database::getStatsSummary());
    exit();
}

// 5. PERIZINAN CRUD API (Backed by SQLite database)
if ($uri === '/api/perizinan' || str_starts_with($uri, '/api/perizinan/')) {
    header('Content-Type: application/json');
    $method = $_SERVER['REQUEST_METHOD'];

    if ($uri === '/api/perizinan/reset' && $method === 'POST') {
        Database::seedPerizinan();
        echo json_encode(['ok' => true, 'message' => 'Perizinan berhasil direset ke standar 80 layanan resmi!']);
        exit();
    }

    if ($method === 'GET') {
        $list = Database::getPerizinanList();
        echo json_encode(['ok' => true, 'total' => count($list), 'data' => $list]);
        exit();
    }

    if ($method === 'POST' || $method === 'PUT') {
        $raw = file_get_contents('php://input');
        $data = json_decode($raw, true) ?? [];
        if (!empty($data['title'])) {
            $saved = Database::savePerizinanItem($data);
            echo json_encode(['ok' => true, 'item' => $saved]);
            exit();
        }
        echo json_encode(['error' => 'Judul perizinan wajib diisi']);
        exit();
    }

    if ($method === 'DELETE') {
        $parts = explode('/', trim($uri, '/'));
        $id = (int)end($parts);
        if ($id > 0) {
            Database::deletePerizinanItem($id);
            echo json_encode(['ok' => true, 'deleted_id' => $id]);
            exit();
        }
        echo json_encode(['error' => 'ID perizinan tidak valid']);
        exit();
    }
}

// 6. KLASTER & PERTANYAAN CRUD API (Backed by SQLite database)
if ($uri === '/api/klaster' || str_starts_with($uri, '/api/klaster/')) {
    header('Content-Type: application/json');
    $method = $_SERVER['REQUEST_METHOD'];

    if ($uri === '/api/klaster/reset' && $method === 'POST') {
        Database::seedKlaster();
        echo json_encode(['ok' => true, 'message' => 'Klaster berhasil direset ke standar 7 klaster resmi!']);
        exit();
    }

    if ($method === 'GET') {
        $tree = Database::getKlasterTree();
        echo json_encode(['ok' => true, 'data' => $tree]);
        exit();
    }

    if ($method === 'POST') {
        $raw = file_get_contents('php://input');
        $data = json_decode($raw, true) ?? [];
        $key = trim($data['key'] ?? '');
        $q = trim($data['question'] ?? '');
        if ($key && $q) {
            Database::addKlasterQuestion($key, $q);
            echo json_encode(['ok' => true, 'key' => $key, 'question' => $q]);
            exit();
        }
        echo json_encode(['error' => 'Klaster key dan pertanyaan wajib diisi']);
        exit();
    }

    if ($method === 'DELETE') {
        $raw = file_get_contents('php://input');
        $data = json_decode($raw, true) ?? [];
        $key = trim($data['key'] ?? $_GET['key'] ?? '');
        $q = trim($data['question'] ?? $_GET['question'] ?? '');
        if ($key && $q) {
            Database::deleteKlasterQuestion($key, $q);
            echo json_encode(['ok' => true, 'deleted' => true]);
            exit();
        }
        echo json_encode(['error' => 'Klaster key dan pertanyaan tidak valid']);
        exit();
    }
}

// 7. LANDING PAGE & SETTINGS PERSISTENCE
if ($uri === '/api/settings') {
    header('Content-Type: application/json');
    $settingsFile = __DIR__ . '/../storage/settings.json';

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $raw = file_get_contents('php://input');
        $incoming = json_decode($raw, true);
        if ($incoming && is_array($incoming)) {
            $existing = [];
            if (file_exists($settingsFile)) {
                $existing = json_decode(file_get_contents($settingsFile), true) ?? [];
            }
            $merged = array_merge($existing, $incoming);
            file_put_contents($settingsFile, json_encode($merged, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
            echo json_encode(['ok' => true, 'settings' => $merged]);
            exit();
        }
        echo json_encode(['error' => 'Data settings tidak valid']);
        exit();
    } else {
        if (file_exists($settingsFile)) {
            echo file_get_contents($settingsFile);
        } else {
            echo json_encode(['ok' => false, 'message' => 'Belum ada settings tersimpan di server']);
        }
        exit();
    }
}

// 8. HEALTH CHECK
if ($uri === '/api/health' || $uri === '/') {
    header('Content-Type: application/json');
    echo json_encode([
        'status' => 'online',
        'service' => 'BUKU SAKU MPP AI Backend API',
        'pemkab' => 'Pemerintah Kabupaten Madiun',
        'database' => 'SQLite (Active: database/bukusaku.sqlite)',
        'version' => '2.0.0'
    ]);
    exit();
}

http_response_code(404);
header('Content-Type: application/json');
echo json_encode(['error' => 'Endpoint tidak ditemukan']);
