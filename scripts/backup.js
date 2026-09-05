// scripts/backup.js
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const backup = {
  // 1. Backup Convex Database
  backupDatabase: () => {
    console.log('📦 Backing up Convex database...');
    const backupDir = './backups';
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir);
    }
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = `./backups/convex-${timestamp}.json`;
    
    exec(`npx convex export --format json > ${backupPath}`, (error) => {
      if (error) {
        console.error('❌ Backup failed:', error);
      } else {
        console.log(`✅ Database backed up to ${backupPath}`);
      }
    });
  },

  // 2. Clean old backups (keep last 30 days)
  cleanOldBackups: () => {
    console.log('🧹 Cleaning old backups...');
    const backupDir = './backups';
    if (!fs.existsSync(backupDir)) return;
    
    const files = fs.readdirSync(backupDir);
    const now = Date.now();
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;
    
    files.forEach(file => {
      const filePath = path.join(backupDir, file);
      const stats = fs.statSync(filePath);
      if (now - stats.mtimeMs > thirtyDays) {
        fs.unlinkSync(filePath);
        console.log(`🗑️ Deleted old backup: ${file}`);
      }
    });
  },

  run: () => {
    console.log('🔧 Starting automatic backup...');
    console.log(`📅 ${new Date().toLocaleDateString()}`);
    backup.backupDatabase();
    backup.cleanOldBackups();
    console.log('✅ Backup complete!');
  }
};

// Run if called directly
if (require.main === module) {
  backup.run();
}

module.exports = backup;