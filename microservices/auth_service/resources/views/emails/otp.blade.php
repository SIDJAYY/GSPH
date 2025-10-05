<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>OTP Code - GoServePH</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
        }
        .content {
            background: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 10px 10px;
        }
        .otp-code {
            background: #fff;
            border: 2px solid #667eea;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            margin: 20px 0;
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 5px;
            color: #667eea;
            font-family: 'Courier New', monospace;
        }
        .warning {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            color: #856404;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            font-size: 12px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>GoServePH</h1>
        <p>Government Services Management System</p>
    </div>
    
    <div class="content">
        <h2>Your OTP Verification Code</h2>
        
        <p>Hello {{ $user->first_name }},</p>
        
        <p>You have requested to verify your account. Please use the following OTP code to complete your verification:</p>
        
        <div class="otp-code">
            {{ $otp_code }}
        </div>
        
        <div class="warning">
            <strong>Important:</strong> This code will expire in 5 minutes. Do not share this code with anyone.
        </div>
        
        <p>If you did not request this verification, please ignore this email or contact our support team.</p>
        
        <p>Best regards,<br>
        The GoServePH Team</p>
    </div>
    
    <div class="footer">
        <p>This is an automated message. Please do not reply to this email.</p>
        <p>© {{ date('Y') }} GoServePH. All rights reserved.</p>
    </div>
</body>
</html>
