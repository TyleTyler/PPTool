const fs = require('fs');
const csv = require('csv-parser');
const phones = [];

// Read phones from CSV
fs.createReadStream('./Phones/PhoneImportV2.csv')
  .pipe(csv())
  .on('data', (row) => phones.push(row))
  .on('end', () => {
    processPhones(phones);
    processModels();
  });

function processPhones(phones) {
  phones.forEach(phone => {
    if (!phone.mac) return;
    let upgradeFile = '';
    if (phone.phmodel.includes("50")) upgradeFile = "spa50x-30x-7-6-2e.bin";
    if (phone.phmodel.includes("51")) upgradeFile = "spa51x-7-6-2e.bin";
    if (phone.phmodel.includes("52")) upgradeFile = "spa525g-7-6-2e-bt.bin";

    const mac = phone.mac.replaceAll(/:/g, "").toLowerCase();
    const keys = Array.from({length: 32}, (_, i) => phone[`Unit_1_Key_${i + 1}`]);
    const content = generatePhoneConfig(phone, upgradeFile, keys);

    fs.writeFileSync(`./Phones/ConfigFiles/spa${mac}.xml`, content);
  });
}

function processModels() {
  const models = ["spa501G", "spa502G", "spa504G", "spa508G", "spa509G", "spa512G", "spa514G", "spa525G2"];
  const server = ""; // You'll need to define this based on your logic

  models.forEach(m => {
    let upgradeFile = '';
    if (m.includes("spa50")) upgradeFile = "spa50x-30x-7-5-2b.bin";
    if (m.includes("spa51")) upgradeFile = "spa51x-7-5-2b.bin";
    if (m.includes("spa52")) upgradeFile = "spa525g-7-6-2e-bt.bin";

    const content = `Server: ${server}\nUpgradeFile: ${upgradeFile}\n`;
    fs.writeFileSync(`./Phones/ConfigFiles/${m}.cfg`, content);
  });
}

function generatePhoneConfig(phone, upgradeFile, keys) {
  let template = fs.readFileSync('./Phones/template.xml', 'utf8');
  console.log({schoolname: phone.schoolname, extension: phone.extension, secret: phone.secret, server: phone.server, ntp: phone.ntp, upgradeFile: upgradeFile});
  template = template.replaceAll("<!SchoolName!>", phone.schoolname)
                      .replaceAll("<!Extension!>", phone.extension)
                      .replaceAll("<!Password!>", phone.secret)
                      .replaceAll("<!Server!>", phone.server)
                      .replaceAll("<!NTP!>", phone.ntp)
                      .replaceAll("<!UpgradeFile!>", upgradeFile);

  keys.forEach((key, index) => {
    template = template.replaceAll(`<!Unit_1_Key_${index + 1}!>`, key);
  });

  return template;
}
