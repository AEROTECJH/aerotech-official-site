// Enhanced Markdown Parser with HTML and Video Support
// This module provides markdown parsing with support for:
// - Standard markdown syntax (headers, lists, links, images, etc.)
// - Raw HTML passthrough
// - Video embedding (iframe, video tags)

(function(global) {
    'use strict';

    /**
     * Parse markdown text to HTML with enhanced features
     * @param {string} markdown - The markdown text to parse
     * @returns {string} - The parsed HTML
     */
    function parseMarkdown(markdown) {
        let html = markdown;

        // Store HTML blocks to preserve them during markdown processing
        const htmlBlocks = [];
        let htmlBlockCounter = 0;

        // Preserve HTML blocks - order matters! Process containers before their contents
        // Preserve block-level HTML elements (div, section, article, etc.) FIRST
        html = html.replace(/<(div|section|article|aside|header|footer|nav|figure|figcaption)[^>]*>.*?<\/\1>/gis, function(match) {
            const placeholder = `___HTML_BLOCK_${htmlBlockCounter}___`;
            htmlBlocks[htmlBlockCounter] = match;
            htmlBlockCounter++;
            return placeholder;
        });

        // Preserve iframe blocks (for YouTube, Vimeo, etc.)
        html = html.replace(/<iframe[^>]*>.*?<\/iframe>/gis, function(match) {
            const placeholder = `___HTML_BLOCK_${htmlBlockCounter}___`;
            htmlBlocks[htmlBlockCounter] = match;
            htmlBlockCounter++;
            return placeholder;
        });

        // Preserve video blocks
        html = html.replace(/<video[^>]*>.*?<\/video>/gis, function(match) {
            const placeholder = `___HTML_BLOCK_${htmlBlockCounter}___`;
            htmlBlocks[htmlBlockCounter] = match;
            htmlBlockCounter++;
            return placeholder;
        });

        // Preserve self-closing HTML tags (img, br, hr when written as HTML)
        html = html.replace(/<(img|br|hr|source|track)[^>]*\/?>/gi, function(match) {
            const placeholder = `___HTML_BLOCK_${htmlBlockCounter}___`;
            htmlBlocks[htmlBlockCounter] = match;
            htmlBlockCounter++;
            return placeholder;
        });

        // Headers
        html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
        html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
        html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
        
        // Bold
        html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        
        // Italic
        html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
        
        // Links
        html = html.replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2">$1</a>');
        
        // Images
        html = html.replace(/!\[([^\]]*)\]\(([^\)]+)\)/g, '<img src="$2" alt="$1">');
        
        // Code blocks
        html = html.replace(/```([^`]+)```/g, '<pre><code>$1</code></pre>');
        
        // Inline code
        html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
        
        // Horizontal rules
        html = html.replace(/^---$/gim, '<hr>');
        
        // Tables (basic support)
        html = html.replace(/^\|(.+)\|$/gim, function(match) {
            const cells = match.split('|').filter(cell => cell.trim());
            const cellsHtml = cells.map(cell => `<td>${cell.trim()}</td>`).join('');
            return `<tr>${cellsHtml}</tr>`;
        });
        
        // Wrap table rows in table
        html = html.replace(/(<tr>.+<\/tr>)+/g, function(match) {
            // First row is header
            const rows = match.split('</tr>').filter(r => r.trim());
            if (rows.length > 0) {
                const headerRow = rows[0].replace(/<td>/g, '<th>').replace(/<\/td>/g, '</th>') + '</tr>';
                const bodyRows = rows.slice(1).join('</tr>') + (rows.length > 1 ? '</tr>' : '');
                return `<table>${headerRow}${bodyRows}</table>`;
            }
            return match;
        });
        
        // Unordered lists
        html = html.replace(/^\- (.+)$/gim, '<li>$1</li>');
        html = html.replace(/(<li>.*<\/li>)+/g, '<ul>$&</ul>');
        
        // Ordered lists
        html = html.replace(/^\d+\. (.+)$/gim, '<li>$1</li>');
        
        // Blockquotes
        html = html.replace(/^> (.+)$/gim, '<blockquote>$1</blockquote>');
        
        // Paragraphs (split by double newlines)
        const lines = html.split('\n');
        let inParagraph = false;
        let result = [];
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            // Skip empty lines
            if (!line) {
                if (inParagraph) {
                    result.push('</p>');
                    inParagraph = false;
                }
                continue;
            }
            
            // Check if line is already wrapped in a tag or is a placeholder
            if (line.match(/^<(h[1-6]|ul|ol|li|pre|code|table|tr|blockquote|hr|img)/) || line.match(/^___HTML_BLOCK_\d+___$/)) {
                if (inParagraph) {
                    result.push('</p>');
                    inParagraph = false;
                }
                result.push(line);
            } else {
                if (!inParagraph) {
                    result.push('<p>');
                    inParagraph = true;
                }
                result.push(line);
                
                // Check if next line is empty or a tag
                if (i === lines.length - 1 || !lines[i + 1].trim() || 
                    lines[i + 1].match(/^<(h[1-6]|ul|ol|li|pre|code|table|tr|blockquote|hr)/) ||
                    lines[i + 1].match(/^___HTML_BLOCK_\d+___$/)) {
                    result.push('</p>');
                    inParagraph = false;
                }
            }
        }
        
        if (inParagraph) {
            result.push('</p>');
        }
        
        html = result.join('\n');

        // Restore HTML blocks
        for (let i = 0; i < htmlBlocks.length; i++) {
            html = html.replace(`___HTML_BLOCK_${i}___`, htmlBlocks[i]);
        }
        
        return html;
    }

    // Export for use in other scripts
    if (typeof module !== 'undefined' && module.exports) {
        // Node.js/CommonJS
        module.exports = { parseMarkdown };
    } else {
        // Browser
        global.MarkdownParser = { parseMarkdown };
    }

})(typeof window !== 'undefined' ? window : this);
