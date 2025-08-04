// pages/api/vendors/index.js
import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const filePath = path.join(process.cwd(), 'data', 'vendors.json');
  const jsonData = fs.readFileSync(filePath);
  let vendors = JSON.parse(jsonData);

  if (req.method === 'GET') {
    res.status(200).json(vendors);
  } else if (req.method === 'POST') {
    const newVendor = req.body;
    newVendor.id = vendors.length ? vendors[vendors.length - 1].id + 1 : 1;
    vendors.push(newVendor);
    fs.writeFileSync(filePath, JSON.stringify(vendors, null, 2));
    res.status(201).json(newVendor);
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
