<!DOCTYPE html>
<html>
<head>
    <title>Test POST</title>
</head>
<body>
    <h2>Test POST Request</h2>
    <button onclick="testSimple()">Test Simple API</button>
    <button onclick="testUsersAPI()">Test Users API</button>
    <div id="result" style="margin-top: 20px; white-space: pre-wrap; font-family: monospace; background: #f0f0f0; padding: 10px;"></div>
    
    <script>
        async function testSimple() {
            const resultDiv = document.getElementById('result');
            resultDiv.innerHTML = 'Testing simple API...';
            
            try {
                const response = await fetch('api/test.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ test: 'data' })
                });
                
                const text = await response.text();
                resultDiv.innerHTML = 'Response from test.php:\n' + text;
                
                // Try to parse JSON
                try {
                    const json = JSON.parse(text);
                    resultDiv.innerHTML += '\n\nJSON parsed successfully!';
                } catch(e) {
                    resultDiv.innerHTML += '\n\nNot valid JSON: ' + e.message;
                }
            } catch(error) {
                resultDiv.innerHTML = 'Error: ' + error.message;
            }
        }
        
        async function testUsersAPI() {
            const resultDiv = document.getElementById('result');
            resultDiv.innerHTML = 'Testing users API...';
            
            try {
                const response = await fetch('api/users.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'login',
                        username: 'testuser',
                        password: 'password'
                    })
                });
                
                const text = await response.text();
                resultDiv.innerHTML = 'Raw response:\n' + text;
                resultDiv.innerHTML += '\n\nResponse length: ' + text.length + ' chars';
                resultDiv.innerHTML += '\nStatus: ' + response.status;
                
                // Show first 20 characters as hex
                const hex = Array.from(text.substring(0, 20)).map(c => c.charCodeAt(0).toString(16)).join(' ');
                resultDiv.innerHTML += '\nFirst 20 chars (hex): ' + hex;
                
                // Try to parse JSON
                try {
                    const json = JSON.parse(text);
                    resultDiv.innerHTML += '\n\n✅ JSON parsed successfully!';
                    resultDiv.innerHTML += '\nSuccess: ' + json.success;
                    if (json.user) {
                        resultDiv.innerHTML += '\nUsername: ' + json.user.username;
                    }
                } catch(e) {
                    resultDiv.innerHTML += '\n\n❌ Not valid JSON: ' + e.message;
                }
            } catch(error) {
                resultDiv.innerHTML = 'Error: ' + error.message;
            }
        }
    </script>
</body>
</html>