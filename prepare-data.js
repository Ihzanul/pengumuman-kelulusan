import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const rawDir = './raw-photos';
const outDir = './public/photos';
const csvPath = './students.csv';

// Pastikan folder tersedia
if (!fs.existsSync(rawDir)) fs.mkdirSync(rawDir);
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function processPhotos() {
  const files = fs.readdirSync(rawDir).filter(f => f.toLowerCase().endsWith('.jpg') || f.toLowerCase().endsWith('.jpeg') || f.toLowerCase().endsWith('.png'));
  
  if (files.length === 0) {
    console.log("❌ Tidak ada file JPG/PNG di folder 'raw-photos'.");
    console.log("👉 Silakan masukkan foto-foto siswa ke dalam folder 'raw-photos'.");
    console.log("👉 Wajib: Namakan file foto dengan NISN siswa (contoh: 1234567890.jpg)");
    return;
  }

  console.log("Memulai proses konversi ke WEBP dan pembuatan file CSV...\n");
  let csvContent = "nisn,name,status,photo_url\n";

  for (const file of files) {
    const nisn = path.parse(file).name; // Mengambil NISN dari nama file
    const outFilename = `${nisn}.webp`;
    const inPath = path.join(rawDir, file);
    const outPath = path.join(outDir, outFilename);

    try {
      // Proses kompresi gambar ke WebP (Lebar maks 400px, Kualitas 80%)
      await sharp(inPath)
        .resize({ width: 400 }) 
        .webp({ quality: 80 })
        .toFile(outPath);

      console.log(`✅ Berhasil mengkonversi: ${file} -> ${outFilename}`);

      // Membuat template baris untuk file CSV
      const photoUrl = `/photos/${outFilename}`;
      csvContent += `"${nisn}","Nama ${nisn}","LULUS","${photoUrl}"\n`;
      
    } catch (err) {
      console.error(`❌ Gagal memproses ${file}: ${err.message}`);
    }
  }

  // Menyimpan file CSV
  fs.writeFileSync(csvPath, csvContent);
  console.log(`\n🎉 SELESAI!`);
  console.log(`1. Foto .webp sudah tersimpan di folder 'public/photos'`);
  console.log(`2. File data siswa berhasil dibuat di: ${csvPath}`);
  console.log(`\nSilakan buka file 'students.csv' tersebut di Excel untuk mengedit nama asli dan status kelulusannya, sebelum di-import ke Supabase.`);
}

processPhotos();
