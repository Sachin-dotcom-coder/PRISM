const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'table-tennis');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Specific API route and Imports
  content = content.replace(/badmintonApi/g, 'tableTennisApi');
  content = content.replace(/IBadmintonMatch/g, 'ITableTennisMatch');
  
  // Endpoints & Navigation
  content = content.replace(/\/badminton/g, '/table-tennis');
  content = content.replace(/api\/table-tennis/g, 'api/table-tennis'); // ensure no doubling

  // Text inside JSX
  content = content.replace(/Badminton match/gi, 'table tennis match');
  content = content.replace(/Badminton CMS/g, 'Table Tennis CMS');
  content = content.replace(/BadmintonAdminPage/g, 'TableTennisAdminPage');
  content = content.replace(/Badminton Matches/g, 'Table Tennis Matches');
  content = content.replace(/Create New Badminton Match/g, 'Create New Table Tennis Match');
  content = content.replace(/Edit Badminton Match/g, 'Edit Table Tennis Match');
  content = content.replace(/No badminton matches found/g, 'No table tennis matches found');
  
  // General text
  content = content.replace(/Badminton/g, 'Table Tennis');
  content = content.replace(/badminton/g, 'tableTennis');
  
  fs.writeFileSync(filePath, content, 'utf8');
}

function processDir(dirPath) {
  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else {
      replaceInFile(fullPath);
    }
  }
}

processDir(dir);
console.log('Successfully completed find & replace for Table Tennis module.');
