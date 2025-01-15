var port = process.env.PORT || 3000,
    http = require('http'),
    fs = require('fs'),
    path = require('path');  // Add path module for file path handling

var log = function(entry) {
    fs.appendFileSync('/tmp/sample-app.log', new Date().toISOString() + ' - ' + entry + '\n');
};

var server = http.createServer(function (req, res) {
    if (req.method === 'POST') {
        var body = '';
        req.on('data', function(chunk) {
            body += chunk;
        });
        req.on('end', function() {
            if (req.url === '/') {
                log('Received message: ' + body);
            } else if (req.url === '/scheduled') {
                log('Received task ' + req.headers['x-aws-sqsd-taskname'] + ' scheduled at ' + req.headers['x-aws-sqsd-scheduled-at']);
            }
            res.writeHead(200, 'OK', {'Content-Type': 'text/plain'});
            res.end();
        });
    } else {
        // Determine the file path based on the requested URL
        var filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
        
        // Check if the file exists
        fs.access(filePath, fs.constants.F_OK, (err) => {
            if (err) {
                // File not found, serve index.html
                filePath = path.join(__dirname, 'index.html');
            }
            
            // Read and serve the file
            fs.readFile(filePath, (err, content) => {
                if (err) {
                    // If there's an error reading the file
                    res.writeHead(500);
                    res.end('Error loading file');
                } else {
                    // Determine content type based on file extension
                    var contentType = 'text/html';
                    var ext = path.extname(filePath);
                    switch (ext) {
                        case '.css':
                            contentType = 'text/css';
                            break;
                        case '.js':
                            contentType = 'text/javascript';
                            break;
                    }
                    
                    res.writeHead(200, { 'Content-Type': contentType });
                    res.end(content);
                }
            });
        });
    }
});

// Listen on port 3000, IP defaults to 127.0.0.1
server.listen(port);

// Put a friendly message on the terminal
console.log('Server running at http://127.0.0.1:' + port + '/');