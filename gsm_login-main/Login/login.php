<?php
// Government Services Management System - SQLite Version
session_start();

// Set content type to JSON
header('Content-Type: application/json');

// Enable CORS for development
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// SQLite database file
$db_file = 'gsm_system.db';

// Response helper function
function sendResponse($success, $message, $data = null, $httpCode = 200) {
    http_response_code($httpCode);
    echo json_encode([
        'success' => $success,
        'message' => $message,
        'data' => $data,
        'timestamp' => date('Y-m-d H:i:s')
    ]);
    exit();
}

// Initialize SQLite database
function initDatabase($db_file) {
    try {
        $pdo = new PDO("sqlite:$db_file");
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        
        // Create users table
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT,
                first_name TEXT NOT NULL,
                last_name TEXT NOT NULL,
                role TEXT DEFAULT 'user',
                status TEXT DEFAULT 'active',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ");
        
        // Create default admin user if not exists
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM users WHERE email = ?");
        $stmt->execute(['admin@gsm.gov.ph']);
        
        if ($stmt->fetchColumn() == 0) {
            $stmt = $pdo->prepare("
                INSERT INTO users (email, password_hash, first_name, last_name, role, status) 
                VALUES (?, ?, ?, ?, ?, ?)
            ");
            $stmt->execute([
                'admin@gsm.gov.ph',
                password_hash('admin123', PASSWORD_DEFAULT),
                'System',
                'Administrator',
                'admin',
                'active'
            ]);
        }
        
        return $pdo;
    } catch (PDOException $e) {
        error_log("Database error: " . $e->getMessage());
        return false;
    }
}

// Input validation
function validateInput($data) {
    $errors = [];
    
    if (empty($data['email'])) {
        $errors[] = 'Email is required';
    } elseif (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
        $errors[] = 'Invalid email format';
    }
    
    if (empty($data['password']) && isset($data['password'])) {
        $errors[] = 'Password is required';
    }
    
    return $errors;
}

// Sanitize input
function sanitizeInput($data) {
    $sanitized = [];
    foreach ($data as $key => $value) {
        $sanitized[$key] = htmlspecialchars(strip_tags(trim($value)), ENT_QUOTES, 'UTF-8');
    }
    return $sanitized;
}

// User authentication
function authenticateUser($email, $password, $pdo) {
    try {
        $stmt = $pdo->prepare("
            SELECT id, email, password_hash, first_name, last_name, role, status 
            FROM users 
            WHERE email = ? AND status = 'active'
        ");
        $stmt->execute([$email]);
        $user = $stmt->fetch();
        
        if ($user && password_verify($password, $user['password_hash'])) {
            return $user;
        }
        
        return false;
    } catch (PDOException $e) {
        error_log("Authentication error: " . $e->getMessage());
        return false;
    }
}

// Main request handler
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        sendResponse(false, 'Invalid JSON input', null, 400);
    }
    
    $sanitizedInput = sanitizeInput($input);
    $errors = validateInput($sanitizedInput);
    
    if (!empty($errors)) {
        sendResponse(false, 'Validation failed', ['errors' => $errors], 400);
    }
    
    $pdo = initDatabase($db_file);
    if (!$pdo) {
        sendResponse(false, 'Database connection failed', null, 500);
    }
    
    $action = $sanitizedInput['action'] ?? 'login';
    
    switch ($action) {
        case 'login':
            if (empty($sanitizedInput['password'])) {
                sendResponse(false, 'Password is required for login', null, 400);
            }
            
            $user = authenticateUser($sanitizedInput['email'], $sanitizedInput['password'], $pdo);
            
            if ($user) {
                // Set session variables
                $_SESSION['user_id'] = $user['id'];
                $_SESSION['email'] = $user['email'];
                $_SESSION['role'] = $user['role'];
                $_SESSION['name'] = $user['first_name'] . ' ' . $user['last_name'];
                
                // Remove sensitive data
                unset($user['password_hash']);
                
                sendResponse(true, 'Login successful', [
                    'user' => $user,
                    'redirect' => 'dashboard.php'
                ]);
            } else {
                sendResponse(false, 'Invalid email or password', null, 401);
            }
            break;
            
        case 'check_email':
            try {
                $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ? AND status = 'active'");
                $stmt->execute([$sanitizedInput['email']]);
                $user = $stmt->fetch();
                
                sendResponse(true, 'Email check completed', [
                    'exists' => (bool)$user
                ]);
            } catch (PDOException $e) {
                sendResponse(false, 'Database error', null, 500);
            }
            break;
            
        default:
            sendResponse(false, 'Invalid action', null, 400);
    }
} else {
    sendResponse(false, 'Method not allowed', null, 405);
}
?>
