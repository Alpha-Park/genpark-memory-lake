#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');
const { program } = require('commander');

const MEMORY_DIR = path.join(os.homedir(), '.genpark_memory_lake');

function initLake() {
    if (!fs.existsSync(MEMORY_DIR)) {
        fs.mkdirSync(MEMORY_DIR, { recursive: true });
        console.log(`🌊 Memory Lake initialized at: ${MEMORY_DIR}`);
    }
}

function storeMemory(content, tags) {
    initLake();
    const timestamp = new Date().toISOString();
    const filename = `${timestamp.replace(/[:.]/g, '-')}.md`;
    const filepath = path.join(MEMORY_DIR, filename);
    
    const markdown = `---\ntags: [${tags.join(', ')}]\ndate: ${timestamp}\n---\n\n${content}\n`;
    fs.writeFileSync(filepath, markdown);
    console.log(`✅ Memory stored securely: ${filename}`);
}

function queryMemory(keyword) {
    initLake();
    const files = fs.readdirSync(MEMORY_DIR).filter(f => f.endsWith('.md'));
    let found = false;
    
    console.log(`\n🔍 Searching Memory Lake for: "${keyword}"\n`);
    
    files.forEach(file => {
        const filepath = path.join(MEMORY_DIR, file);
        const content = fs.readFileSync(filepath, 'utf-8');
        
        if (content.toLowerCase().includes(keyword.toLowerCase())) {
            found = true;
            console.log(`📄 [MATCH] ${file}`);
            // Extract the body (skip frontmatter)
            const body = content.split('---').slice(2).join('---').trim();
            console.log(`   "${body.substring(0, 150)}${body.length > 150 ? '...' : ''}"\n`);
        }
    });
    
    if (!found) {
        console.log(`❌ No memories found matching "${keyword}".`);
    }
}

program
  .name('genpark-memory-lake')
  .description('Local, private, and portable lifelong memory management for AI agents.')
  .version('1.0.0');

program.command('store')
  .description('Store a new memory in the lake')
  .requiredOption('-c, --content <text>', 'The memory content')
  .option('-t, --tags <tags>', 'Comma-separated tags', '')
  .action((options) => {
      const tagsArray = options.tags ? options.tags.split(',').map(t => t.trim()) : [];
      storeMemory(options.content, tagsArray);
  });

program.command('query')
  .description('Search the memory lake for a keyword')
  .requiredOption('-k, --keyword <term>', 'Keyword to search for')
  .action((options) => {
      queryMemory(options.keyword);
  });

program.parse(process.argv);
