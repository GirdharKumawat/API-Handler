document.addEventListener('DOMContentLoaded', function() {
    // Cache DOM Elements
    const apiInput = document.getElementById('apiInput');
    const keyInput = document.getElementById('keyInput');
    const getCodeBtn = document.getElementById('getCodeBtn');
    const outputSection = document.getElementById('outputSection');
    const outputCode = document.getElementById('outputCode');
    const outputValue = document.getElementById('outputValue');
    const copyIcon = document.getElementById('copyIcon');

    // Hide output section initially
    outputSection.style.display = 'none';

    // Fetch API Data
    async function fetchAPIData(url) {        
        try {
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            
            const data = await response.json();
            
            return data;
        } catch (error) {
            
            return null;
        }
    }

    // Find All Paths to Key in Nested Object
    function findKeyPaths(obj, targetKey) {
        
        
        const allPaths = [];
        function recursiveSearch(data, key, path = []) {
            for (let k in data) {
                let currentPath = [...path, k];
                
                if (k === key) {
                    allPaths.push(currentPath);
                }
                
                if (data[k] && typeof data[k] === 'object') {
                    recursiveSearch(data[k], key, currentPath);
                }
            }
        }

        recursiveSearch(obj, targetKey);
        console.log(allPaths);
        
        return allPaths.length > 0 ? allPaths : null;
    }

    // Generate JavaScript Code to Access Values
    function generateAccessCodes(paths, key) {
        if (!paths || paths.length === 0) {
            
            return null;
        }

        const codes = paths.map(path => {
            let code = 'let value = data';
            path.forEach(p => {
                code += `['${p}']`;
            });
            code += ';';
            return code;
        });

        
        return codes;
    }

    // Main Function to Handle Code Generation
    async function handleCodeGeneration() {
        const apiUrl = apiInput.value;
        const key = keyInput.value;

        if (!apiUrl || !key) {
            
            return;
        }

        try {
            const data = await fetchAPIData(apiUrl);
            
            if (!data) {
                outputCode.textContent = 'Failed to fetch data';
                return;
            }

            const keyPaths = findKeyPaths(data, key);
            
            if (!keyPaths) {
                outputCode.textContent = `Key "${key}" not found`;
                return;
            }

            // Generate access codes for all paths
            const accessCodes = generateAccessCodes(keyPaths, key);
            
            // Retrieve values at each path
            const valuesAtPaths = keyPaths.map(path => 
                path.reduce((acc, curr) => acc[curr], data)
            );

            // Format output
            outputCode.textContent = accessCodes.join('\n\n');
            outputValue.textContent = valuesAtPaths.map(
                (value, index) => `Path ${index + 1}: ${JSON.stringify(value, null, 2)}`
            ).join('\n\n');
            
            outputSection.style.display = 'block';
        } catch (error) {
            
        }
    }

    // Copy to Clipboard
    function copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            
            copyIcon.textContent = '✅';
            setTimeout(() => {
                copyIcon.textContent = '📋';
            }, 2000);
        }).catch(err => {
            
        });
    }

    // Event Listeners
    getCodeBtn.addEventListener('click', handleCodeGeneration);
    copyIcon.addEventListener('click', () => copyToClipboard(outputCode.textContent));
});
 